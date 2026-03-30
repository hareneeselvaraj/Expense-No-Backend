using ExpenseTracker.DTOs.Transaction;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using ExcelDataReader;

using System.Data;
using ExpenseTracker.Data;
using MiniExcelLibs;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using System.Text.RegularExpressions;

namespace ExpenseTracker.Services.Implementations;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IEmailService _emailService;
    private readonly AppDbContext _context;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(
        ITransactionRepository transactionRepo,
        IAccountRepository accountRepo,
        ICategoryRepository categoryRepo,
        IEmailService emailService,
        AppDbContext context,
        ILogger<TransactionService> logger)
    {
        _transactionRepo = transactionRepo;
        _accountRepo = accountRepo;
        _categoryRepo = categoryRepo;
        _emailService = emailService;
        _context = context;
        _logger = logger;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── AI Categorization Engine v4 — Trained on Real ICICI Bank Data ───
    // ── Trained on 1768 real transactions from user's bank statement    ──
    // ──   Phase 1: Parse ICICI statement format → extract merchant/purpose
    // ──   Phase 2: Match extracted tokens against keyword dictionary      
    // ── Categories: Expense (27) · Income (3) · Investment (9)          ──
    // ══════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Extracts searchable tokens (merchant name, purpose, VPA) from ICICI bank
    /// statement formats. Falls back to the raw remarks if no pattern matches.
    /// </summary>
    private static string ExtractMerchantTokens(string remarks)
    {
        var r = remarks.Trim();

        // ── UPI/Name/VPA/Purpose/Bank/RefNum/Hash  ──
        // Example: UPI/BENGALURU/gpay-121901573/Egg/AXIS BANK/080329017536/UPI…
        if (r.StartsWith("UPI/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            var tokens = new List<string>();
            // parts[1] = name, parts[2] = VPA, parts[3] = purpose (if exists)
            if (parts.Length > 1) tokens.Add(parts[1]); // merchant name
            if (parts.Length > 2) tokens.Add(parts[2]); // VPA – often contains merchant id
            if (parts.Length > 3) tokens.Add(parts[3]); // purpose / description
            if (parts.Length > 4) tokens.Add(parts[4]); // bank name sometimes has info
            return string.Join(" ", tokens).ToLower();
        }

        // ── NEFT/Ref/Name/Purpose ──
        if (r.StartsWith("NEFT/", StringComparison.OrdinalIgnoreCase) ||
            r.StartsWith("NEFT CR/", StringComparison.OrdinalIgnoreCase) ||
            r.StartsWith("NEFT DR/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            return string.Join(" ", parts.Skip(1)).ToLower();
        }

        // ── BIL/INFT/Ref/Name/Purpose (IMPS) ──
        if (r.StartsWith("BIL/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            return string.Join(" ", parts.Skip(2)).ToLower();
        }

        // ── EBA/ (Electronic Bank Account – investment/trading) ──
        // Real patterns: EBA/MFP-xxx (mutual fund), EBA/EQ Trade (stocks), EBA/NSE M (stocks)
        if (r.StartsWith("EBA/", StringComparison.OrdinalIgnoreCase))
        {
            return r.ToLower();
        }

        // ── MMT/IMPS/ ──
        // Real: MMT/IMPS/xxxxx/Bill Payment/NAME/Bank
        if (r.StartsWith("MMT/", StringComparison.OrdinalIgnoreCase) ||
            r.StartsWith("IMPS/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            return string.Join(" ", parts.Skip(1)).ToLower();
        }

        // ── ATM/NFS patterns ──
        if (r.StartsWith("ATM/", StringComparison.OrdinalIgnoreCase) ||
            r.StartsWith("NFS/", StringComparison.OrdinalIgnoreCase))
        {
            return r.ToLower();
        }

        // ── CAM/ (Cash At Machine — ATM withdrawal/deposit) ──
        // Real: CAM/23401HHR/CASH WDL/23-06-25, CAM/23401HHR/CASH DEP-Self/28-06-25/7682
        if (r.StartsWith("CAM/", StringComparison.OrdinalIgnoreCase))
        {
            return r.ToLower();
        }

        // ── ACH/ (Automated Clearing House — salary, NACH debits) ──
        // Real: ACH/LARSEN AND TOUBRO LI/24944176, ACH/STATE BANK OF INDIA/6468294
        if (r.StartsWith("ACH/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            return string.Join(" ", parts.Skip(1)).ToLower();
        }

        // ── CMS/ (Cash Management) ──
        if (r.StartsWith("CMS/", StringComparison.OrdinalIgnoreCase))
        {
            var parts = r.Split('/');
            return string.Join(" ", parts.Skip(1)).ToLower();
        }

        // ── BA/HDFC or RBL/ (bank transfers) ──
        if (r.StartsWith("BA/", StringComparison.OrdinalIgnoreCase) ||
            r.StartsWith("RBL/", StringComparison.OrdinalIgnoreCase))
        {
            return r.ToLower();
        }

        // ── Fallback: use full remarks ──
        return r.ToLower();
    }

    private (string CategoryName, TransactionType Type) CategorizeTransaction(string remarks, bool isDeposit)
    {
        // Phase 1: Extract merchant tokens from ICICI format
        var tokens = ExtractMerchantTokens(remarks);
        var lower = remarks.ToLower().Trim(); // Keep original for fallback matching

        // Helper: match against either parsed tokens or full string
        bool Match(params string[] keywords) =>
            keywords.Any(k => tokens.Contains(k) || lower.Contains(k));

        // ═══════════════════════════════════════════════════════════
        // ── DEPOSIT (Credit) → Income / Investment ──────────────
        // ═══════════════════════════════════════════════════════════
        if (isDeposit)
        {
            // ── Salary ──
            // Real: "Salary Credit", ACH/LARSEN AND TOUBRO LI/xxxxx
            if (Match("salary", "salary credit", "neft/sal", "cred/sal", "sal/", "payroll",
                       "monthly pay", "stipend", "wages", "salary cr",
                       "larsen and toubro", "ach/larsen"))
                return ("Salary", TransactionType.Income);

            // ── Interest (Investment) ──
            // Real: 095701001739:Int.Pd:29-03-2025 to 29-06-2025
            if (Match("interest", "int.", "int/", "int cr", "cr interest", "savings interest",
                       "sb int", "int pd", "interest credit", "int.pd", ":int.pd:"))
                return ("interest", TransactionType.Investment);

            // ── FD maturity/interest (Investment) ──
            if (Match("fixed deposit", "fd maturity", "fd interest", "fd redemption",
                       "term deposit", "fd cr", "fd/"))
                return ("FD", TransactionType.Investment);

            // ── RD maturity/interest (Investment) ──
            if (Match("recurring deposit", "rd maturity", "rd interest", "rd/", "rd cr"))
                return ("RD", TransactionType.Investment);

            // ── Mutual Fund redemption (Investment) ──
            // Real: EBA/MFP-8509585030-xxx (Mutual Fund Payment)
            if (Match("mutual fund", "mf redemption", "mf/", "groww", "zerodha",
                       "kuvera", "coin by zerodha", "sip redeem", "mf cr",
                       "sbi mutual", "hdfc mutual", "icici prudential", "axis mutual",
                       "amc", "fund house", "eba/mfp"))
                return ("Mutual fund", TransactionType.Investment);

            // ── Stocks dividend/sale (Investment) ──
            // Real: EBA/NSE M 2025071/xxx, EBA/Upstreamed Payin/xxx
            if (Match("dividend", "stocks", "share", "nse", "bse", "cdsl",
                       "upstox", "demat", "angel", "eq trade", "share sale",
                       "dp credit", "securities", "eba/nse", "upstreamed payin"))
                return ("Stocks", TransactionType.Investment);

            // ── SGB (Investment) ──
            if (Match("sgb", "sovereign gold", "gold bond","gold"))
                return ("SGB", TransactionType.Investment);

            // ── PPF (Investment) ──
            if (Match("ppf", "public provident"))
                return ("PPF", TransactionType.Investment);

            // ── NPS (Investment) ──
            if (Match("nps", "national pension", "pension fund", "pfrda"))
                return ("NPS", TransactionType.Investment);

            // ── Generic investment return (Investment) ──
            // Real: MMT/IMPS/xxx/Deposit or Inve/YASWANTHRA/SBI
            if (Match("investment return", "inv return", "maturity proceed",
                       "deposit or inve"))
                return ("investment", TransactionType.Investment);

            // ── Cashback (Income) ──
            // Real: UPI/NPCI BHIM -/BHIMCASH, UPI/bhimcashback@hd/HDFC BANK
            if (Match("cashback", "cash back", "reward", "refund", "reversal",
                       "cred cashback", "paytm cashback", "gpay cashback",
                       "rewards", "loyalty", "offer credit", "promotional",
                       "npci bhim", "bhimcash", "bhimcashba"))
                return ("cashback", TransactionType.Income);

            // ── Wife sent money (Income) ──
            // Real: UPI/HARENEE A/xxx with various purposes
            if (Match("wife", "harenee"))
                return ("wife", TransactionType.Income);

            // ── Default deposit = Income / others ──
            return ("others", TransactionType.Income);
        }

        // ═══════════════════════════════════════════════════════════
        // ── WITHDRAWAL (Debit) → Expense / Investment / Withdraw ─
        // ═══════════════════════════════════════════════════════════

        // ── ATM / Cash Withdrawal → Withdraw ──
        // Real: CAM/23401HHR/CASH WDL/23-06-25
        if (Match("atm", "cash withdraw", "cash w/d", "atm/cash", "atm wd",
                   "nfs/", "self withdrawal", "atwd", "atm/nfs", "cash wdl",
                   "cam/", "cash dep"))
            return ("others", TransactionType.Withdraw);

        // ═══ INVESTMENT (Debit side — money going out to invest) ═══

        // ── EBA/EQ Trade or EBA/NSE → Stocks ──
        if (Match("eq trade", "eba/eq", "eba/nse", "upstreamed payin"))
            return ("Stocks", TransactionType.Investment);

        // ── Mutual Fund purchase ──
        // Real: EBA/MFP-8509585030-xxx (Mutual Fund Payment via ICICI)
        if (Match("mutual fund", "sip", "groww", "zerodha", "kuvera",
                   "parag parikh", "sbi mf", "hdfc mf", "icici pru", "axis mf",
                   "nippon", "dsp mf", "bsp/", "mf purchase", "coin/",
                   "motilal", "kotak mf", "tata mf", "aditya birla",
                   "uti mf", "mirae", "quant mf", "canara robeco",
                   "franklin", "invesco", "l&t mf", "hsbc mf",
                   "sbi mutual", "hdfc mutual", "icici prudential",
                   "axis mutual", "systematic invest", "sip/",
                   "eba/mfp"))
            return ("Mutual fund", TransactionType.Investment);

        // ── Stocks / Trading ──
        if (Match("stocks", "upstox", "angel", "share purchase", "demat",
                   "nse", "bse", "cdsl", "nsdl", "trading", "intraday",
                   "equity", "smallcase", "5paisa", "dhan", "finvasia",
                   "securities", "iifl", "motilal oswal", "sharekhan",
                   "kotak securities", "icici direct", "dp charges",
                   "brokerage", "f&o", "futures", "options"))
            return ("Stocks", TransactionType.Investment);

        // ── SGB ──
        if (Match("sgb", "sovereign gold", "gold bond"))
            return ("SGB", TransactionType.Investment);

        // ── FD booking ──
        if (Match("fixed deposit", "fd booking", "fd/", "term deposit",
                   "fd open", "fd placement", "fd dr"))
            return ("FD", TransactionType.Investment);

        // ── RD instalment ──
        if (Match("recurring deposit", "rd/", "rd instalment", "rd installment",
                   "rd dr", "rd debit"))
            return ("RD", TransactionType.Investment);

        // ── PPF ──
        if (Match("ppf", "public provident", "ppf contribution", "ppf deposit"))
            return ("PPF", TransactionType.Investment);

        // ── NPS ──
        if (Match("nps", "national pension", "pension", "pfrda",
                   "nps contribution", "nps tier"))
            return ("NPS", TransactionType.Investment);

        // ── Generic investment ──
        // Real: MMT/IMPS/xxx/Deposit or Inve/YASWANTHRA/SBI
        if (Match("investment", "invest", "portfolio", "wealth management",
                   "deposit or inve"))
            return ("investment", TransactionType.Investment);

        // ── Interest paid on loan (Investment category) ──
        // Real: 095701001739:Int.Pd:29-03-2025 to 29-06-2025
        if (Match("interest") && Match("paid", "debit", "emi"))
            return ("interest", TransactionType.Investment);
        if (Match("int.pd", ":int.pd:"))
            return ("interest", TransactionType.Investment);

        // ═══ EXPENSE categories (ordered by likelihood) ═══

        // ── Outside Food ──
        // Real merchants: Sri Krishn(Tea/Coffee/Pavbhaji), SWIGGY, ZOMATO, ADYAR ANAN(Idly/Coffee),
        // EatClub, Empire Pho, TANJORE TI, SOMTSHERIN(Momos), GANESH KAM(Shawarma), FRESHALICI
        if (Match("swiggy", "zomato", "kfc", "mcdonald", "food", "restaurant",
                   "bakery", "dominos", "pizza", "burger", "subway", "starbucks",
                   "cafe", "coffee", "chaayos", "biryani", "dunzo food",
                   "blinkit food", "dine", "eatery", "canteen", "tiffin",
                   "mess", "dhaba", "haldiram", "wok", "chick", "uber eats",
                   "eatsure", "faasos", "behrouz", "box8", "oven story",
                   "mojo pizza", "la pino", "baskin", "ice cream", "dessert",
                   "sweet", "mithai", "juice", "smoothie", "chai",
                   "tea post", "chaiwala", "third wave", "blue tokai",
                   "sri krishn", "adyar anan", "eatclub", "empire pho",
                   "tanjore ti", "somtsherin", "ganesh kam", "freshalici",
                   "swiggy din", "swiggy lim", "swiggy ltd", "zomato lim",
                   "eternal li", "upiswiggy", "payzomato", "swiggyupi",
                   "pav bhaji", "panipuri", "momos", "shawarma", "idly",
                   "dosa", "lunch", "dinner", "breakfast", "snacks",
                   "tea", "chips", "sandwich", "noodle", "manchurian",
                   "chaat", "pani puri", "paratha", "thali",
                   "rameshwara"))
            return ("outsidefood", TransactionType.Expense);

        // ── Petrol / Fuel ──
        if (Match("petrol", "fuel", "indian oil", "iocl", "bpcl", "hpcl",
                   "shell", "diesel", "petrol pump", "petroleum",
                   "filling station", "fuel station", "essar", "nayara",
                   "reliance petrol", "cng"))
            return ("petrol", TransactionType.Expense);

        // ── Transportation ──
        // Real: UPI/CHENNAI ME/xxx/Metro, UPI/SREEJITH P/xxx/Auto
        // IRCTC/railway/train/redbus moved here per user request
        if (Match("uber", "ola", "rapido", "metro", "namma", "bmtc",
                   "bus ticket", "auto", "cab", "taxi", "rideshare",
                   "yulu", "bounce", "vogo", "toll", "fastag", "parking",
                   "commute", "meru", "savaari", "shuttle", "indriver",
                   "ola money", "uber india", "ride", "nha", "netc",
                   "chennai me", "sreejith", "merro",
                   "irctc", "irctc rail", "indian rai", "irctc etic",
                   "irctcpgonline", "irctctouri", "railway", "train ticket",
                   "redbus", "platformti", "platform", "ticket"))
            return ("transportation", TransactionType.Expense);

        // ── Travel (flights, hotels, tourism only) ──
        if (Match("travel", "airways", "indigo", "spicejet",
                   "air india", "vistara", "flight", "airline", "makemytrip",
                   "goibibo", "cleartrip", "booking.com", "hotel", "oyo",
                   "airbnb", "resort", "holiday", "trip", "tourism",
                   "ixigo", "yatra",
                   "trivago", "agoda", "hostel", "treebo", "fabhotel",
                   "zostel", "lemon tree", "taj hotel", "itc hotel",
                   "oberoi", "radisson", "passport", "visa", "pilgrimage",
                   "hotelroom"))
            return ("travel", TransactionType.Expense);

        // ── Groceries ──
        // Real: UPI/BIG BASKET, UPI/BB Daily, UPI/Blinkit, UPI/BENGALURU(Vegetable/Egg),
        //       UPI/SUPRIYA S(Vegetable/Egg/Chilli), UPI/NAGARAJ H(Egg/Vegetable),
        //       UPI/YASEEN AHM(Mutton/Liver), UPI/M N MART(Milk/Grocery),
        //       UPI/SM Bangalo(More), UPI/KRISHNA M(Coconut), BIL/xxx/Grocery/xxx
        if (Match("dmart", "reliance fresh", "big bazaar", "bigbasket",
                   "grofers", "blinkit", "zepto", "jiomart", "more super",
                   "spencer", "grocery", "groceries", "supermarket",
                   "provision", "kirana", "vegetables", "fruits", "dairy",
                   "milk", "ration", "nature basket", "swiggy instamart",
                   "dunzo", "basket", "star bazaar", "spar", "ratnadeep",
                   "nilgiris", "biscuits", "wholesale", "organic",
                   "fresh", "liver", "more", "chicken", "mutton",
                   "big basket", "bb daily", "bigbasket.ebz", "bigbasket.esbz",
                   "easebuzz.bbdail", "sm bangalo", "m n mart",
                   "krishna m", "vegetable", "egg", "coconut",
                   "ginger", "chilli", "pudhina", "onion", "tomato",
                   "potato", "rice", "dal", "atta", "flour",
                   "oil", "sugar", "salt", "spice", "masala"))
            return ("groceries", TransactionType.Expense);

        // ── Clothing ──
        if (Match("myntra", "ajio", "nykaa fashion", "pantaloons",
                   "max fashion", "zara", "h&m", "westside", "lifestyle",
                   "clothing", "garment", "apparel", "textile", "fabric",
                   "tailor", "meesho", "shein", "bewakoof", "uniqlo",
                   "levi", "puma", "nike", "adidas", "shoppers stop",
                   "trent", "fbb", "reliance trends", "v-mart", "central",
                   "cotton", "silk", "saree", "kurti", "ethnic",
                   "raymond", "peter england", "van heusen", "allen solly",
                   "us polo", "wrangler", "pepe jeans", "jack", "jones",
                   "h&m", "forever 21", "mango"))
            return ("clothing", TransactionType.Expense);

        // ── Entertainment ──
        if (Match("netflix", "spotify", "hotstar", "disney", "movie",
                   "cinema", "bookmyshow", "pvr", "inox", "youtube premium",
                   "prime video", "zee5", "sonyliv", "jiocinema", "game",
                   "gaming", "playstation", "xbox", "steam", "concert",
                   "theatre", "amusement", "park ticket", "subscription",
                   "apple music", "gaana", "hungama", "audible", "kindle",
                   "ps plus", "twitch", "discord nitro", "epic games",
                   "nintendo", "fun", "arcade", "wonderla", "imagicaa",
                   "esselworld", "water park", "theme park", "carnival",
                   "circus", "show", "festival", "event"))
            return ("entertainment", TransactionType.Expense);

        // ── Phone Recharge ──
        // Real: UPI/Jio Prepai/xxx/express, UPI/Jio Prepai/xxx/Myjiorec, UPI/Jio Prepai/xxx/Jiophonere
        if (Match("recharge", "airtel", "jio prepai", "bsnl", "vi ", "vodafone",
                   "idea", "mobile bill", "postpaid", "prepaid", "sim ",
                   "telecom", "phone bill", "data pack", "talktime",
                   "airtel thanks", "my jio", "vi app", "mtnl",
                   "myjiorec", "jiophonere", "jio prepaid"))
            return ("phone recharge", TransactionType.Expense);

        // ── Electricity ──
        // Real: UPI/Axis Bank/xxx/Electric b
        if (Match("electricity", "bescom", "electric bill", "power bill",
                   "cesc", "tata power", "torrent power", "adani electric",
                   "kseb", "tangedco", "msedcl", "uppcl", "bses",
                   "bijli", "eb bill", "wbsedcl", "pspcl", "dhbvn",
                   "uhbvn", "jvvnl", "avvnl", "cspdcl", "nbpdcl",
                   "sbpdcl", "mescom", "hescom", "gescom", "brpl",
                   "power supply", "unit charge", "meter",
                   "electric b"))
            return ("electricity", TransactionType.Expense);

        // ── Water ──
        if (Match("water", "bwssb", "water bill", "water board",
                   "jal board", "jalkal", "water supply", "water tax",
                   "tanker", "water works", "phed", "water utility",
                   "mcgm water", "hmwssb", "cmwssb", "dwasa"))
            return ("water", TransactionType.Expense);

        // ── Gas Bill ──
        if (Match("gas bill", "gasbill", "hpcl gas", "indane",
                   "bharat gas", "lpg", "cylinder", "cooking gas",
                   "piped gas", "mahanagar gas", "igl", "gail",
                   "adani gas", "green gas", "sabarmati gas",
                   "torrent gas", "indraprastha gas", "gas connection"))
            return ("gasbill", TransactionType.Expense);

        // ── Household ──
        if (Match("household", "furniture", "ikea", "pepperfry",
                   "urban ladder", "rent", "maintenance", "society",
                   "plumber", "electrician", "repair", "house",
                   "kitchen", "utensil", "cleaning", "maid", "cook",
                   "interior", "decor", "pest control", "laundry",
                   "dry clean", "godrej", "hettich", "nilkamal",
                   "hometown", "@home", "home centre", "d-mart home",
                   "apartment", "flat", "housing", "property",
                   "landlord", "pg", "hostel rent", "mess bill",
                   "packers", "movers", "shifting", "ac service",
                   "roplant", "aquaguard", "water purifier",
                   "washing machine", "fridge", "microwave", "mixer",
                   "fan", "geyser", "chimney"))
            return ("household", TransactionType.Expense);

        // ── Personal ──
        // Real: UPI/APOLLO PHA/xxx/Payment
        if (Match("pharmacy", "apollo", "1mg", "hospital", "clinic",
                   "health", "medical", "medicine", "doctor", "dental",
                   "eye", "optical", "salon", "haircut", "spa", "beauty",
                   "parlour", "parlor", "gym", "fitness", "yoga",
                   "grooming", "skincare", "nykaa", "pharma", "netmeds",
                   "practo", "insurance premium", "lic", "star health",
                   "max life", "health insurance", "personal care",
                   "toiletries", "dermatologist", "physio", "therapy",
                   "lab test", "diagnostic", "scan", "surgery",
                   "operation", "medplus", "truemeds", "tata 1mg",
                   "cult fit", "cure fit", "anytime fitness",
                   "gold gym", "bodybuilding", "supplement",
                   "protein", "vitamin", "cosmetic", "makeup",
                   "perfume", "deodorant", "shampoo",
                   "apollo pha"))
            return ("personal", TransactionType.Expense);

        // ── Education ──
        if (Match("education", "school", "college", "fees", "tuition",
                   "university", "course", "udemy", "coursera",
                   "unacademy", "byju", "vedantu", "coaching",
                   "book", "library", "exam", "training", "certificate",
                   "skill", "workshop", "seminar", "upgrad",
                   "great learning", "simplilearn", "edx", "linkedin learn",
                   "pluralsight", "skillshare", "academia", "scholar",
                   "leetcode", "hackerrank", "codechef", "codeforces",
                   "institute", "academy", "class", "lecture",
                   "tutor", "study", "notebook", "stationery"))
            return ("education", TransactionType.Expense);

        // ── Stationary ──
        if (Match("stationery", "stationary", "pen ", "notebook",
                   "paper", "printing", "xerox", "photocopy",
                   "stapler", "marker", "pencil", "eraser",
                   "ruler", "ink", "cartridge", "lamination",
                   "binding", "stamp"))
            return ("stationary", TransactionType.Expense);

        // ── Vehicle ──
        if (Match("vehicle", "car ", "bike ", "service center",
                   "car service", "bike service", "tyre", "tire",
                   "engine oil", "mechanic", "garage", "car wash",
                   "motor insurance", "vehicle insurance", "road tax",
                   "rc renewal", "emission", "pollution check",
                   "spare parts", "battery", "brake", "clutch",
                   "alignment", "wheel", "suspension", "dent",
                   "paint", "body shop", "rto", "driving",
                   "dl renewal", "maruti", "hyundai", "honda",
                   "toyota", "mahindra", "bajaj", "hero", "tvs",
                   "royal enfield", "ktm", "yamaha", "suzuki",
                   "service station", "workshop"))
            return ("vehicle", TransactionType.Expense);

        // ── TV ──
        // Real: BIL/001040636420/Tvbill/403562569137100
        if (Match("tv ", "cable", "dth", "tata play", "tata sky",
                   "dish tv", "airtel dth", "sun direct", "d2h",
                   "set top box", "cable tv", "cable operator",
                   "den networks", "hathway", "siti cable",
                   "tvbill"))
            return ("TV", TransactionType.Expense);

        // ── Electronics ──
        if (Match("electronics", "laptop", "computer", "samsung",
                   "apple", "iphone", "macbook", "realme", "oneplus",
                   "xiaomi", "redmi", "croma", "reliance digital",
                   "vijay sales", "headphone", "earphone", "tablet",
                   "printer", "gadget", "charger", "electronic",
                   "oppo", "vivo", "poco", "iqoo", "nothing",
                   "pixel", "motorola", "nokia", "lenovo", "dell",
                   "hp ", "asus", "acer", "lg ", "sony",
                   "jbl", "boat", "noise", "smartwatch",
                   "monitor", "keyboard", "mouse", "speaker",
                   "camera", "go pro", "powerbank", "usb",
                   "cable", "adapter", "earbuds", "airpods"))
            return ("electronics", TransactionType.Expense);

        // ── Jewellery ──
        if (Match("jewel", "gold", "silver", "diamond", "tanishq",
                   "kalyan", "malabar", "joyalukkas", "grt ",
                   "titan", "caratlane", "ring", "necklace",
                   "bangle", "ornament", "platinum", "gemstone",
                   "ruby", "emerald", "precious", "24 karat",
                   "22 karat", "hallmark", "bullion", "senco",
                   "tribhavan", "lalitha", "thangamayil",
                   "bluestone", "melorra", "candere", "mangatrai",
                   "waman hari", "png jewellers"))
            return ("Jewellery", TransactionType.Expense);

        // ── Tax ──
        if (Match("income tax", "gst", "tds", "advance tax",
                   "self assessment", "property tax", "professional tax",
                   "challan", "nsdl tax", "oltas", "itr",
                   "tax payment", "cess", "surcharge",
                   "municipal tax", "stamp duty", "registration",
                   "e-filing", "tax refund"))
            return ("tax", TransactionType.Expense);

        // ── Office ──
        if (Match("office", "co-working", "coworking", "wework",
                   "workspace", "desk", "office supply", "meeting room",
                   "91springboard", "bhive", "awfis", "innov8",
                   "regus", "office space", "cabin"))
            return ("office", TransactionType.Expense);

        // ── Gifts ──
        if (Match("gift", "donation", "charity", "present",
                   "contribute", "wishes", "wedding gift", "birthday",
                   "anniversary", "return gift", "housewarming",
                   "shagun", "wedding", "marriage", "vidai",
                   "engagement", "ceremony", "function",
                   "crowdfunding", "milaap", "ketto",
                   "give india", "ngo", "trust"))
            return ("gifts", TransactionType.Expense);

        // ── Temple ──
        if (Match("temple", "church", "mosque", "pooja", "puja",
                   "religious", "mandir", "spiritual", "tirumala",
                   "devasthan", "gurudwara", "ashram", "hundi",
                   "dakshina", "archana", "prasad", "dham",
                   "tirupati", "vaishno devi", "shirdi",
                   "saibaba", "aarti", "yagna", "havan"))
            return ("temple", TransactionType.Expense);

        // ── Wife (Expense — transfer to wife) ──
        // Real: UPI/HARENEE A/xxx with Dress, Makeup, Watch gift etc.
        if (Match("wife", "harenee"))
            return ("wife", TransactionType.Expense);

        // ── SMS / Bank Charges ──
        // Real: SMSChgsJan25-Mar25+GST, DCARDFEE8476JUN25-MAY26+GST, CashDep Chgs 01-30JUN25+GST
        if (Match("sms", "sms charge", "msg charge", "message charge",
                   "alert charge", "sms alert", "bank charge",
                   "service charge", "annual fee", "maintenance charge",
                   "debit card fee", "card fee", "processing fee",
                   "transaction charge", "convenience fee",
                   "account charge", "min balance", "penalty",
                   "smschgs", "dcardfee", "cashdep chgs", "+gst"))
            return ("SMS charges", TransactionType.Expense);


        // ── Petrol (from UPI purpose) ──
        // Real: UPI/SRI 000 Ve/xxx/441petrol, UPI/SRI VENKAT/xxx/Petrol
        if (Match("petrol", "441petrol"))
            return ("petrol", TransactionType.Expense);

        // ── Clothing (from UPI purpose) ──
        // Real: UPI/HARENEE A/xxx/Dress, UPI/BANDHUGULA/xxx/Blouse, UPI/SARAVANA S/xxx/Dress
        if (Match("dress", "blouse"))
            return ("clothing", TransactionType.Expense);

        // ── Bill Payments → others ──
        // Real: MMT/IMPS/xxx/Bill Payment/YASWANTHRA/SBI, BIL/xxx/Advance/xxx
        if (Match("bill pay", "billdesk", "bill/", "nach",
                   "ecs", "standing instruction", "mandate",
                   "auto debit", "bill payment", "advance"))
            return ("others", TransactionType.Expense);

        // ── EMI → others ──
        if (Match("emi", "loan", "equated monthly", "home loan",
                   "car loan", "personal loan", "education loan",
                   "bajaj finance", "hdfc ltd", "lic housing",
                   "sbi home", "pnb housing"))
            return ("others", TransactionType.Expense);

        // ── Flipkart/Amazon (check purpose for specific category) ──
        // Real: UPI/Flipkart P/xxx/Kitchensta→household, Mederma→personal, Washbag→personal
        if (Match("flipkart", "amazon", "amazon ind", "amazon pay",
                   "flipkart p", "snapdeal", "shopping", "mall"))
            return ("others", TransactionType.Expense);

        // ── Default fallback ──
        return ("others", TransactionType.Expense);
    }

    // ── AI Helper: Clean up raw bank descriptions ──
    private string GenerateSmartDescription(string remarks)
    {
        var clean = remarks;
        
        // Remove common messy prefixes/suffixes
        if (clean.StartsWith("UPI/"))
        {
            var parts = clean.Split('/');
            if (parts.Length >= 3)
            {
                // Typical format: UPI/Name/VPA/Bank/...
                // Or: UPI/Name/merchant@bank/...
                clean = "UPI Payment to " + parts[1];
                if (parts.Length > 3 && !parts[3].Contains("BANK", StringComparison.OrdinalIgnoreCase))
                {
                    clean += " - " + parts[3];
                }
            }
        }
        else if (clean.StartsWith("BIL/INFT/"))
        {
            var parts = clean.Split('/');
            if (parts.Length >= 4) clean = "IMPS Transfer - " + parts[3];
        }
        else if (clean.StartsWith("NEFT/"))
        {
            var parts = clean.Split('/');
            if (parts.Length >= 3) clean = "NEFT Transfer - " + parts[2];
        }
        else if (clean.StartsWith("EBA/"))
        {
            var parts = clean.Split('/');
            if (parts.Length >= 2) clean = "Bank Transfer - " + parts[1];
        }

        // Clean up excessive spaces and newlines
        clean = clean.Replace("\\n", " ").Replace("\\r", "").Trim();
        if (clean.Length > 200) clean = clean.Substring(0, 197) + "...";
        
        return clean;
    }

    // ── Helper: Get or Create Category ──
    private async Task<Guid> GetOrCreateCategoryAsync(Guid userId, string categoryName, TransactionType catType)
    {
        var existing = await _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == categoryName.ToLower());
        
        if (existing != null) return existing.Id;

        // Auto-create category
        var newCat = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = categoryName,
            Type = catType switch
            {
                TransactionType.Income     => CategoryType.Income,
                TransactionType.Investment => CategoryType.Income,   // investment returns are income-like
                _                          => CategoryType.Expense,  // Expense, Withdraw → Expense
            },
            Icon = "🏷️"
        };
        _context.Categories.Add(newCat);
        await _context.SaveChangesAsync();
        _logger.LogInformation("[AI] Created category '{Name}' ({Type}) for user {UserId}", categoryName, catType, userId);
        return newCat.Id;
    }

    public async Task<IEnumerable<TransactionResponseDto>> UploadPreviewAsync(Guid userId, Guid accountId, Stream fileStream, string fileName)
    {
        var previewList = new List<TransactionResponseDto>();
        var account = await _accountRepo.GetByIdAsync(accountId);
        var accountName = account?.Name ?? "Unknown Account";
        
        var extension = Path.GetExtension(fileName).ToLower();
        int count = 0;

        _logger.LogWarning("[UPLOAD] Starting upload for user={UserId}, account={AccountId}, file={FileName}", userId, accountId, fileName);

        if (extension == ".xlsx" || extension == ".xls" || extension == ".csv")
        {
            // useHeaderRow: false is crucial for bank statements with top metadata rows
            IList<IDictionary<string, object>> rawRows = new List<IDictionary<string, object>>();
            if (extension == ".xls")
            {
                using var reader = ExcelReaderFactory.CreateBinaryReader(fileStream);
                var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = false } });
                var dataTable = result.Tables[0];
                foreach (System.Data.DataRow r in dataTable.Rows)
                {
                    var dict = new Dictionary<string, object>();
                    for (int i = 0; i < dataTable.Columns.Count; i++)
                        dict[$"Col{i}"] = r[i];
                    rawRows.Add(dict);
                }
            }
            else
            {
                rawRows = MiniExcelLibs.MiniExcel.Query(fileStream, useHeaderRow: false).Cast<IDictionary<string, object>>().ToList();
            }
            _logger.LogWarning("[UPLOAD] MiniExcel parsed {Count} raw rows", rawRows.Count);

            bool headerFound = false;
            var columnMap = new Dictionary<string, string>(); 
            var mappedRows = new List<IDictionary<string, object>>();

            foreach (var row in rawRows)
            {
                if (!headerFound)
                {
                    var values = row.Values.Select(v => v?.ToString()?.Trim() ?? "").ToList();
                    var stringVals = string.Join(" | ", values).ToLower();

                    // Detect target header row (ICICI or Standard)
                    if ((stringVals.Contains("date") || stringVals.Contains("value date") || stringVals.Contains("transaction date")) 
                        && (stringVals.Contains("remarks") || stringVals.Contains("description") || stringVals.Contains("particulars") || stringVals.Contains("narration")))
                    {
                        foreach (var kvp in row)
                        {
                            var val = kvp.Value?.ToString()?.Trim() ?? "";
                            if (!string.IsNullOrEmpty(val))
                            {
                                columnMap[kvp.Key] = val; 
                            }
                        }
                        headerFound = true;
                        _logger.LogInformation("[UPLOAD] Header row found at line. Keys mapped: {Keys}", string.Join(", ", columnMap.Values));
                    }
                    continue; // Skip the header row itself
                }

                // Create a mapped row using the columnMap
                var mappedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                foreach (var kvp in row)
                {
                    if (columnMap.TryGetValue(kvp.Key, out var actualHeaderName))
                    {
                        mappedRow[actualHeaderName] = kvp.Value;
                    }
                }
                
                // Only add if it has some data in the known columns
                if (mappedRow.Values.Any(v => v != null && !string.IsNullOrWhiteSpace(v.ToString())))
                {
                    mappedRows.Add(mappedRow);
                }
            }

            foreach (var row in mappedRows)
            {
                try
                {
                    // Helper to find column by partial name match
                    object? GetFuzzy(string partial)
                    {
                        var key = row.Keys.FirstOrDefault(k => k != null && k.Contains(partial, StringComparison.OrdinalIgnoreCase));
                        return key != null ? row[key] : null;
                    }

                    // ── 1. Parse Date ──
                    DateTime date = DateTime.UtcNow;
                    bool dateFound = false;

                    var dateVal = GetFuzzy("Date");
                    if (dateVal is DateTime dtDirect) { date = dtDirect; dateFound = true; }
                    else if (dateVal != null)
                    {
                        var dateStr = dateVal.ToString()!.Trim();
                        if (!string.IsNullOrEmpty(dateStr))
                        {
                            string[] formats = { "dd.MM.yyyy", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "dd/MM/yy" };
                            foreach (var fmt in formats)
                            {
                                if (DateTime.TryParseExact(dateStr, fmt, null, System.Globalization.DateTimeStyles.None, out var d))
                                { date = d; dateFound = true; break; }
                            }
                            if (!dateFound && DateTime.TryParse(dateStr, out var dp))
                            { date = dp; dateFound = true; }
                        }
                    }

                    if (!dateFound) { _logger.LogWarning("[UPLOAD] Skipping row: no valid date found"); continue; }

                    // ── 2. Determine Format ──
                    var remarks = GetFuzzy("Remarks")?.ToString()?.Trim() ?? GetFuzzy("Description")?.ToString()?.Trim() ?? GetFuzzy("Narration")?.ToString()?.Trim();
                    if (string.IsNullOrEmpty(remarks)) continue;

                    var typeStr = GetFuzzy("Type")?.ToString();
                    
                    if (string.IsNullOrEmpty(typeStr))
                    {
                        // ══ BANK STATEMENT FORMAT (ICICI, HDFC, etc.) ══
                        var withdrawalStr = GetFuzzy("Withdrawal")?.ToString() ?? GetFuzzy("Debit")?.ToString();
                        var depositStr = GetFuzzy("Deposit")?.ToString() ?? GetFuzzy("Credit")?.ToString();

                        decimal withdrawal = 0, deposit = 0;
                        if (!string.IsNullOrEmpty(withdrawalStr)) decimal.TryParse(withdrawalStr, out withdrawal);
                        if (!string.IsNullOrEmpty(depositStr)) decimal.TryParse(depositStr, out deposit);

                        bool isDeposit = deposit > 0;
                        decimal amount = isDeposit ? deposit : withdrawal;
                        if (amount <= 0) continue;

                        var description = GenerateSmartDescription(remarks);
                        var (categoryName, txType) = CategorizeTransaction(remarks, isDeposit);
                        var categoryId = await GetOrCreateCategoryAsync(userId, categoryName, txType);

                        var bankMode = remarks.Contains("UPI", StringComparison.OrdinalIgnoreCase) ? BankMode.GPay : BankMode.Other;
                        var onlineOffline = remarks.Contains("UPI", StringComparison.OrdinalIgnoreCase) ? OnlineOffline.Online : OnlineOffline.Offline;

                        var category = await _context.Categories.FindAsync(categoryId);

                        var dto = new TransactionResponseDto
                        {
                            Id = Guid.NewGuid(),
                            AccountId = accountId,
                            AccountName = accountName,
                            CategoryId = categoryId,
                            CategoryName = category?.Name ?? "Unknown",
                            CategoryIcon = category?.Icon,
                            Amount = Math.Abs(amount),
                            Type = txType.ToString(),
                            OnlineOffline = onlineOffline.ToString(),
                            BankMode = bankMode.ToString(),
                            Description = description,
                            Date = date,
                            IsMonitor = false,
                            IsAutoDebit = false
                        };

                        previewList.Add(dto);
                        count++;
                        _logger.LogWarning("[UPLOAD PREVIEW] Parsed Rs.{Amount} | {Type}", amount, txType);
                    }
                    else
                    {
                        // ══ STANDARD FORMAT (has Type column) ══
                        var amountStr = GetFuzzy("Amount")?.ToString();
                        var categoryStr = GetFuzzy("Category")?.ToString() ?? "Shopping";

                        if (!string.IsNullOrEmpty(amountStr) && decimal.TryParse(amountStr, out var amount) && amount > 0)
                        {
                            var type = Enum.TryParse<TransactionType>(typeStr, true, out var t) ? t : TransactionType.Expense;
                            var categoryId = await GetOrCreateCategoryAsync(userId, categoryStr, type);

                            var category = await _context.Categories.FindAsync(categoryId);

                            var dto = new TransactionResponseDto
                            {
                                Id = Guid.NewGuid(),
                                AccountId = accountId,
                                AccountName = accountName,
                                CategoryId = categoryId,
                                CategoryName = category?.Name ?? "Unknown",
                                CategoryIcon = category?.Icon,
                                Amount = Math.Abs(amount),
                                Type = type.ToString(),
                                OnlineOffline = OnlineOffline.Online.ToString(),
                                BankMode = BankMode.Other.ToString(),
                                Description = remarks,
                                Date = date,
                                IsMonitor = false,
                                IsAutoDebit = false
                            };

                            previewList.Add(dto);
                            count++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[UPLOAD] Failed to process row");
                }
            }

        }
        else
        {
            throw new InvalidOperationException("Unsupported file format. Please upload .xlsx or .csv");
        }

        return previewList;
    }

    public async Task<int> UploadCommitAsync(Guid userId, IEnumerable<TransactionResponseDto> dtos)
    {
        int count = 0;
        foreach (var dto in dtos)
        {
            var createDto = new CreateTransactionDto
            {
                AccountId = dto.AccountId,
                CategoryId = dto.CategoryId,
                Amount = dto.Amount,
                Type = Enum.Parse<TransactionType>(dto.Type),
                OnlineOffline = Enum.Parse<OnlineOffline>(dto.OnlineOffline),
                BankMode = dto.BankMode == "Unknown" || string.IsNullOrEmpty(dto.BankMode) ? null : Enum.Parse<BankMode>(dto.BankMode),
                Description = dto.Description,
                Date = dto.Date,
                IsMonitor = dto.IsMonitor,
                IsAutoDebit = dto.IsAutoDebit
            };

            await CreateAsync(userId, createDto);
            count++;
        }
        return count;
    }

    public async Task<int> UploadAsync(Guid userId, Guid accountId, Stream fileStream, string fileName)
    {
        var preview = await UploadPreviewAsync(userId, accountId, fileStream, fileName);
        return await UploadCommitAsync(userId, preview);
    }

    public async Task<TransactionResponseDto> CreateAsync(Guid userId, CreateTransactionDto dto)
    {
        // ── Validation ──

        // Online transactions require BankMode
        if (dto.OnlineOffline == OnlineOffline.Online && dto.BankMode == null)
            throw new InvalidOperationException("BankMode is required for Online transactions.");

        // Transfer requires TransferAccountId
        if (dto.Type == TransactionType.Transfer && dto.TransferAccountId == null)
            throw new InvalidOperationException("TransferAccountId is required for Transfer transactions.");

        var account = await _accountRepo.GetByIdAsync(dto.AccountId);
        if (account == null || account.UserId != userId)
            throw new InvalidOperationException("Account not found.");

        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null || category.UserId != userId)
            throw new InvalidOperationException("Category not found.");

        // ── Build transaction ──
        var transaction = new Transaction
        {
            UserId = userId,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Type = dto.Type,
            OnlineOffline = dto.OnlineOffline,
            BankMode = dto.BankMode,
            Description = dto.Description,
            Date = dto.Date ?? DateTime.UtcNow,
            IsMonitor = dto.IsMonitor,
            IsAutoDebit = dto.IsAutoDebit,
            TransferAccountId = dto.TransferAccountId,
            TagId = dto.TagId,
            InvestmentId = dto.InvestmentId
        };

        // ── Business rules: adjust account balances ──
        switch (dto.Type)
        {
            case TransactionType.Transfer:
                // Transfer: debit source, credit destination — not income or expense
                var transferAccount = await _accountRepo.GetByIdAsync(dto.TransferAccountId!.Value);
                if (transferAccount == null || transferAccount.UserId != userId)
                    throw new InvalidOperationException("Transfer account not found.");

                // Debit source
                if (account.Type == AccountType.CreditCard)
                    account.Balance += dto.Amount; // Cash advance / withdrawal from credit card
                else
                    account.Balance -= dto.Amount;

                // Credit destination
                if (transferAccount.Type == AccountType.CreditCard)
                    transferAccount.Balance -= dto.Amount; // Payment to credit card from another account
                else
                    transferAccount.Balance += dto.Amount;

                await _accountRepo.UpdateAsync(account);
                await _accountRepo.UpdateAsync(transferAccount);
                break;

            case TransactionType.Income:
                if (account.Type == AccountType.CreditCard)
                    account.Balance -= dto.Amount; // Payment to credit card
                else
                    account.Balance += dto.Amount;
                await _accountRepo.UpdateAsync(account);
                break;

            case TransactionType.Expense:
                // If IsAutoDebit = true AND CategoryType = Investment → count as investment, NOT expense
                if (dto.IsAutoDebit && category.Type == CategoryType.Investment)
                {
                    // Treated as investment — deduct from account but do NOT count as expense
                    if (account.Type == AccountType.CreditCard)
                        account.Balance += dto.Amount;
                    else
                        account.Balance -= dto.Amount;
                    await _accountRepo.UpdateAsync(account);
                    // Override the transaction type to Investment
                    transaction.Type = TransactionType.Investment;
                }
                else
                {
                    if (account.Type == AccountType.CreditCard)
                        account.Balance += dto.Amount;
                    else
                        account.Balance -= dto.Amount;
                    await _accountRepo.UpdateAsync(account);
                }
                break;

            case TransactionType.Investment:
            case TransactionType.Withdraw:
                if (account.Type == AccountType.CreditCard)
                    account.Balance += dto.Amount;
                else
                    account.Balance -= dto.Amount;
                await _accountRepo.UpdateAsync(account);
                break;
        }

        await _transactionRepo.AddAsync(transaction);

        // ── Update linked Investment record ──
        if (transaction.InvestmentId.HasValue)
        {
            var investment = await _context.Investments.FindAsync(transaction.InvestmentId.Value);
            if (investment != null && investment.UserId == userId)
            {
                investment.InvestedAmount += dto.Amount;
                investment.CurrentValue += dto.Amount;
                _context.Investments.Update(investment);
                await _context.SaveChangesAsync();
            }
        }

        // ── Budget alert check ──
        await CheckBudgetAndNotifyAsync(userId, transaction.CategoryId, transaction.Date);

        // Reload with navigation properties
        var created = await _transactionRepo.GetByIdWithDetailsAsync(transaction.Id);
        return MapToDto(created!);
    }

    public async Task<IEnumerable<TransactionResponseDto>> GetAllAsync(Guid userId)
    {
        var transactions = await _transactionRepo.GetByUserIdAsync(userId);
        return transactions.Select(MapToDto);
    }

    public async Task<IEnumerable<TransactionResponseDto>> GetFilteredAsync(
        Guid userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, Guid? categoryId, Guid? accountId)
    {
        var transactions = await _transactionRepo.GetByUserIdFilteredAsync(
            userId, startDate, endDate, type, categoryId, accountId);
        return transactions.Select(MapToDto);
    }

    public async Task<TransactionResponseDto?> GetByIdAsync(Guid userId, Guid id)
    {
        var transaction = await _transactionRepo.GetByIdWithDetailsAsync(id);
        if (transaction == null || transaction.UserId != userId) return null;
        return MapToDto(transaction);
    }

    public async Task<TransactionResponseDto?> UpdateAsync(Guid userId, Guid id, UpdateTransactionDto dto)
    {
        var transaction = await _transactionRepo.GetByIdWithDetailsAsync(id);
        if (transaction == null || transaction.UserId != userId) return null;

        // ── Step 1: Snapshot original values ──
        var originalAmount    = transaction.Amount;
        var originalType      = transaction.Type;
        var originalAccountId = transaction.AccountId;
        var originalTransferAccountId = transaction.TransferAccountId;

        // ── Step 2: Reverse original balance effect ──
        var originalAccount = await _accountRepo.GetByIdAsync(originalAccountId);
        if (originalAccount != null)
        {
            bool isCreditCard = originalAccount.Type == AccountType.CreditCard;

            switch (originalType)
            {
                case TransactionType.Income:
                    // Was added to balance → subtract it back
                    originalAccount.Balance -= originalAmount;
                    await _accountRepo.UpdateAsync(originalAccount);
                    break;

                case TransactionType.Expense:
                case TransactionType.Investment:
                case TransactionType.Withdraw:
                    // Was deducted → add it back
                    // CreditCard: was added to outstanding (balance +=) → subtract back
                    if (isCreditCard)
                        originalAccount.Balance -= originalAmount;
                    else
                        originalAccount.Balance += originalAmount;
                    await _accountRepo.UpdateAsync(originalAccount);
                    break;

                case TransactionType.Transfer:
                    // Source account: deducted → add back
                    originalAccount.Balance += originalAmount;
                    await _accountRepo.UpdateAsync(originalAccount);
                    // Destination account: credited → deduct back
                    if (originalTransferAccountId.HasValue)
                    {
                        var origTransfer = await _accountRepo.GetByIdAsync(originalTransferAccountId.Value);
                        if (origTransfer != null)
                        {
                            origTransfer.Balance -= originalAmount;
                            await _accountRepo.UpdateAsync(origTransfer);
                        }
                    }
                    break;
            }
        }

        // ── Step 3: Apply field changes ──
        if (dto.AccountId.HasValue)           transaction.AccountId         = dto.AccountId.Value;
        if (dto.CategoryId.HasValue)          transaction.CategoryId        = dto.CategoryId.Value;
        if (dto.Amount.HasValue)              transaction.Amount            = dto.Amount.Value;
        if (dto.Type.HasValue)                transaction.Type              = dto.Type.Value;
        if (dto.OnlineOffline.HasValue)       transaction.OnlineOffline     = dto.OnlineOffline.Value;
        if (dto.BankMode.HasValue)            transaction.BankMode          = dto.BankMode.Value;
        if (dto.Description != null)          transaction.Description       = dto.Description;
        if (dto.Date.HasValue)                transaction.Date              = dto.Date.Value;
        if (dto.IsMonitor.HasValue)           transaction.IsMonitor         = dto.IsMonitor.Value;
        if (dto.IsAutoDebit.HasValue)         transaction.IsAutoDebit       = dto.IsAutoDebit.Value;
        if (dto.TagId.HasValue)               transaction.TagId             = dto.TagId.Value;
        if (dto.InvestmentId.HasValue)        transaction.InvestmentId      = dto.InvestmentId.Value;

        // Clear transfer account if type changed away from Transfer
        if (dto.Type.HasValue && dto.Type.Value != TransactionType.Transfer)
            transaction.TransferAccountId = null;
        else if (dto.TransferAccountId.HasValue)
            transaction.TransferAccountId = dto.TransferAccountId.Value;

        // ── Step 4: Apply NEW balance effect ──
        var newAccount = await _accountRepo.GetByIdAsync(transaction.AccountId);
        if (newAccount != null)
        {
            bool isCreditCard = newAccount.Type == AccountType.CreditCard;

            // Re-fetch category for IsAutoDebit → Investment override check
            var category = await _categoryRepo.GetByIdAsync(transaction.CategoryId);

            switch (transaction.Type)
            {
                case TransactionType.Income:
                    newAccount.Balance += transaction.Amount;
                    await _accountRepo.UpdateAsync(newAccount);
                    break;

                case TransactionType.Expense:
                    bool isAutoInvestment = transaction.IsAutoDebit && category?.Type == CategoryType.Investment;
                    if (isAutoInvestment)
                    {
                        transaction.Type = TransactionType.Investment; // override
                        if (isCreditCard) newAccount.Balance += transaction.Amount;
                        else              newAccount.Balance -= transaction.Amount;
                    }
                    else
                    {
                        if (isCreditCard) newAccount.Balance += transaction.Amount;
                        else              newAccount.Balance -= transaction.Amount;
                    }
                    await _accountRepo.UpdateAsync(newAccount);
                    break;

                case TransactionType.Investment:
                case TransactionType.Withdraw:
                    if (isCreditCard) newAccount.Balance += transaction.Amount;
                    else              newAccount.Balance -= transaction.Amount;
                    await _accountRepo.UpdateAsync(newAccount);
                    break;

                case TransactionType.Transfer:
                    if (transaction.TransferAccountId == null)
                        throw new InvalidOperationException("TransferAccountId is required for Transfer.");
                    newAccount.Balance -= transaction.Amount;
                    await _accountRepo.UpdateAsync(newAccount);
                    var newTransfer = await _accountRepo.GetByIdAsync(transaction.TransferAccountId.Value);
                    if (newTransfer != null)
                    {
                        newTransfer.Balance += transaction.Amount;
                        await _accountRepo.UpdateAsync(newTransfer);
                    }
                    break;
            }
        }

        await _transactionRepo.UpdateAsync(transaction);

        var updated = await _transactionRepo.GetByIdWithDetailsAsync(id);
        return MapToDto(updated!);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var transaction = await _transactionRepo.GetByIdWithDetailsAsync(id);
        if (transaction == null || transaction.UserId != userId) return false;

        // ── Reverse the account balance adjustment that was applied on creation ──
        var account = await _accountRepo.GetByIdAsync(transaction.AccountId);
        if (account != null)
        {
            switch (transaction.Type)
            {
                case TransactionType.Income:
                    account.Balance -= transaction.Amount;
                    await _accountRepo.UpdateAsync(account);
                    break;

                case TransactionType.Expense:
                case TransactionType.Investment:
                case TransactionType.Withdraw:
                    account.Balance += transaction.Amount;
                    await _accountRepo.UpdateAsync(account);
                    break;

                case TransactionType.Transfer:
                    account.Balance += transaction.Amount; // Reverse debit on source
                    await _accountRepo.UpdateAsync(account);

                    if (transaction.TransferAccountId.HasValue)
                    {
                        var transferAccount = await _accountRepo.GetByIdAsync(transaction.TransferAccountId.Value);
                        if (transferAccount != null)
                        {
                            transferAccount.Balance -= transaction.Amount; // Reverse credit on destination
                            await _accountRepo.UpdateAsync(transferAccount);
                        }
                    }
                    break;
            }
        }

        // ── Reverse linked Investment record ──
        if (transaction.InvestmentId.HasValue)
        {
            var investment = await _context.Investments.FindAsync(transaction.InvestmentId.Value);
            if (investment != null && investment.UserId == userId)
            {
                investment.InvestedAmount -= transaction.Amount;
                investment.CurrentValue -= transaction.Amount;
                _context.Investments.Update(investment);
                await _context.SaveChangesAsync();
            }
        }

        await _transactionRepo.DeleteAsync(transaction);
        return true;
    }

    public async Task<int> DeleteBulkAsync(Guid userId, IEnumerable<Guid> ids)
    {
        int count = 0;
        foreach (var id in ids)
        {
            if (await DeleteAsync(userId, id))
            {
                count++;
            }
        }
        return count;
    }

    private static TransactionResponseDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        AccountId = t.AccountId,
        AccountName = t.Account?.Name ?? string.Empty,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon,
        Amount = t.Amount,
        Type = t.Type.ToString(),
        OnlineOffline = t.OnlineOffline.ToString(),
        BankMode = t.BankMode?.ToString(),
        Description = t.Description,
        Date = t.Date,
        IsMonitor = t.IsMonitor,
        IsAutoDebit = t.IsAutoDebit,
        TransferAccountId = t.TransferAccountId,
        TransferAccountName = t.TransferAccount?.Name,
        TagId = t.TagId,
        TagName = t.Tag?.Name,
        InvestmentId = t.InvestmentId,
        InvestmentName = t.Investment?.Name
    };

    private async Task CheckBudgetAndNotifyAsync(Guid userId, Guid categoryId, DateTime transactionDate)
    {
        try
        {
            var month = transactionDate.Month;
            var year  = transactionDate.Year;
    
            _logger.LogInformation(
                "[BUDGET CHECK] userId={UserId}, categoryId={CategoryId}, month={Month}/{Year}",
                userId, categoryId, month, year);
    
            // ── 1. Find the matching budget ──
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b =>
                    b.UserId     == userId     &&
                    b.CategoryId == categoryId &&
                    b.Month      == month      &&
                    b.Year       == year);
    
            if (budget == null)
            {
                _logger.LogInformation(
                    "[BUDGET CHECK] No budget found for categoryId={CategoryId}, {Month}/{Year} — skipping.",
                    categoryId, month, year);
                return;
            }
    
            // Only re-alert if the previous alert was at least 1 hour ago (debounce).
            if (budget.AlertSentAt.HasValue &&
                (DateTime.UtcNow - budget.AlertSentAt.Value).TotalHours < 1)
            {
                _logger.LogInformation("[BUDGET CHECK] Alert already sent recently — skipping.");
                return;
            }
    
            // ── 2. Materialise transactions, then sum in-memory (SQLite-safe) ──
            var startOfMonth = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfMonth   = startOfMonth.AddMonths(1);
    
            // FIX: ToListAsync() first, then .Sum() — avoids the SumAsync SQLite crash.
            var expenses = await _context.Transactions
                .Where(t =>
                    t.UserId     == userId         &&
                    t.CategoryId == categoryId     &&
                    t.Type       == TransactionType.Expense &&
                    t.Date       >= startOfMonth   &&
                    t.Date       <  endOfMonth)
                .ToListAsync();                        // ← materialise
    
            var totalSpent = expenses.Sum(t => t.Amount); // ← in-memory sum (safe)
    
            _logger.LogInformation(
                "[BUDGET CHECK] Spent={TotalSpent}, Limit={BudgetAmount} ({Count} txns)",
                totalSpent, budget.Amount, expenses.Count);
    
            if (totalSpent <= budget.Amount)
            {
                _logger.LogInformation("[BUDGET CHECK] Within budget — no alert.");
                return;
            }
    
            // ── 3. Send alert ──
            var user     = await _context.Users.FindAsync(userId);
            var category = await _context.Categories.FindAsync(categoryId);
    
            if (user == null)
            {
                _logger.LogWarning("[BUDGET CHECK] User {UserId} not found — skipping alert.", userId);
                return;
            }
    
            _logger.LogInformation(
                "[BUDGET ALERT] Sending email to {Email}: {Category} {Spent}/{Budget}",
                user.Email, category?.Name, totalSpent, budget.Amount);
    
            await _emailService.SendBudgetAlertAsync(
                user.Email,
                user.Name,
                category?.Name ?? "Unknown",
                budget.Amount,
                totalSpent,
                month,
                year);
    
            // Mark alert sent
            budget.AlertSentAt = DateTime.UtcNow;
            _context.Budgets.Update(budget);
            await _context.SaveChangesAsync();
    
            _logger.LogInformation("[BUDGET ALERT] ✅ Email sent and AlertSentAt updated.");
        }
        catch (Exception ex)
        {
            // Never let notification failure break the transaction itself.
            _logger.LogError(ex,
                "[BUDGET ALERT ERROR] userId={UserId}, categoryId={CategoryId}",
                userId, categoryId);
        }
    }

    /// <summary>Diagnostic: manually trigger a budget check for a category in the current month.</summary>
    public async Task<BudgetCheckResultDto> TestBudgetCheckAsync(Guid userId, Guid categoryId)
    {
        var now = DateTime.UtcNow;
        var month = now.Month;
        var year = now.Year;
        var result = new BudgetCheckResultDto();

        try
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.UserId == userId
                    && b.CategoryId == categoryId
                    && b.Month == month
                    && b.Year == year);

            if (budget == null)
            {
                result.Error = $"No budget found for categoryId={categoryId}, month={month}/{year}";
                return result;
            }

            result.BudgetFound = true;
            result.BudgetId = budget.Id;
            result.BudgetAmount = budget.Amount;

            var startOfMonth = new DateTime(year, month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var expenses2 = await _context.Transactions
                .Where(t => t.UserId == userId
                    && t.CategoryId == categoryId
                    && t.Type == TransactionType.Expense
                    && t.Date >= startOfMonth
                    && t.Date < endOfMonth)
                .ToListAsync();
            result.TotalSpent = expenses2.Sum(t => t.Amount);

            result.Exceeded = result.TotalSpent > result.BudgetAmount;

            if (!result.Exceeded)
            {
                result.Error = $"Spending {result.TotalSpent} is within budget {result.BudgetAmount} — no email sent";
                return result;
            }

            // Actually send the email
            var user = await _context.Users.FindAsync(userId);
            var category = await _context.Categories.FindAsync(categoryId);

            if (user == null)
            {
                result.Error = "User not found";
                return result;
            }

            await _emailService.SendBudgetAlertAsync(
                user.Email, user.Name,
                category?.Name ?? "Unknown",
                budget.Amount, result.TotalSpent,
                month, year);

            result.EmailSent = true;
        }
        catch (Exception ex)
        {
            result.Error = ex.ToString();
            _logger.LogError(ex, "[BUDGET TEST] Failed for userId={UserId}, categoryId={CategoryId}", userId, categoryId);
        }

        return result;
    }
}
