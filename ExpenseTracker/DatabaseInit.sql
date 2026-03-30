CREATE TABLE [PriceCaches] (
    [Ticker] nvarchar(50) NOT NULL,
    [Price] decimal(18,4) NOT NULL,
    [Currency] nvarchar(10) NOT NULL,
    [Source] nvarchar(50) NOT NULL,
    [FetchedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_PriceCaches] PRIMARY KEY ([Ticker])
);
GO


CREATE TABLE [Users] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Email] nvarchar(200) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CoupleId] uniqueidentifier NULL,
    [CoupleRole] nvarchar(max) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Accounts] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Balance] decimal(18,2) NOT NULL,
    [CreditLimit] decimal(18,2) NULL,
    CONSTRAINT [PK_Accounts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Accounts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Categories] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Icon] nvarchar(max) NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Categories_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Couples] (
    [Id] uniqueidentifier NOT NULL,
    [OwnerId] uniqueidentifier NOT NULL,
    [PartnerId] uniqueidentifier NULL,
    [InviteCode] nvarchar(8) NOT NULL,
    [InviteEmail] nvarchar(200) NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Couples] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Couples_Users_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Couples_Users_PartnerId] FOREIGN KEY ([PartnerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Investments] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [AssetType] nvarchar(50) NULL,
    [Category] nvarchar(20) NULL,
    [Quantity] decimal(18,4) NULL,
    [BuyPrice] decimal(18,2) NULL,
    [InvestedAmount] decimal(18,2) NOT NULL,
    [CurrentValue] decimal(18,2) NOT NULL,
    [Platform] nvarchar(100) NULL,
    [Notes] nvarchar(500) NULL,
    [DateInvested] datetime2 NULL,
    [InterestRate] decimal(18,2) NULL,
    [TenureMonths] int NULL,
    [MonthlyAmount] decimal(18,2) NULL,
    [InvestmentFrequency] nvarchar(20) NULL,
    [Status] nvarchar(20) NULL,
    [MonthsCompleted] int NULL,
    [LastProcessedDate] datetime2 NULL,
    [ProjectedMaturityValue] decimal(18,2) NULL,
    [Ticker] nvarchar(50) NULL,
    [PriceSource] nvarchar(20) NULL,
    [LastPriceUpdate] datetime2 NULL,
    [ISIN] nvarchar(50) NULL,
    [SchemeCode] nvarchar(50) NULL,
    [SectorTag] nvarchar(100) NULL,
    CONSTRAINT [PK_Investments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Investments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [PortfolioSnapshots] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Date] datetime2 NOT NULL,
    [TotalValue] decimal(18,2) NOT NULL,
    [TotalInvested] decimal(18,2) NOT NULL,
    [TotalPnl] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_PortfolioSnapshots] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PortfolioSnapshots_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Reminders] (
    [Id] uniqueidentifier NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Date] datetime2 NOT NULL,
    [Amount] decimal(18,2) NULL,
    [Category] nvarchar(max) NOT NULL,
    [Priority] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Reminders] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Reminders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Tags] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Name] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Tags] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Tags_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Vehicles] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [VehicleType] nvarchar(10) NOT NULL,
    [FuelType] nvarchar(20) NOT NULL,
    [RegistrationNumber] nvarchar(20) NULL,
    [ServiceIntervalKm] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Vehicles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Vehicles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Budgets] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Year] int NOT NULL,
    [Month] int NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [AlertSentAt] datetime2 NULL,
    CONSTRAINT [PK_Budgets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Budgets_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Budgets_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [AssetTransactions] (
    [Id] uniqueidentifier NOT NULL,
    [InvestmentId] uniqueidentifier NOT NULL,
    [TxnType] nvarchar(20) NOT NULL,
    [Date] datetime2 NOT NULL,
    [Units] decimal(18,4) NOT NULL,
    [Price] decimal(18,4) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Notes] nvarchar(500) NULL,
    CONSTRAINT [PK_AssetTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AssetTransactions_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Dividends] (
    [Id] uniqueidentifier NOT NULL,
    [InvestmentId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Date] datetime2 NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_Dividends] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Dividends_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [SIPs] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [InvestmentId] uniqueidentifier NOT NULL,
    [MonthlyAmount] decimal(18,2) NOT NULL,
    [ExecutionDay] int NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [NextExecutionDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SIPs] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SIPs_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_SIPs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Transactions] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [AccountId] uniqueidentifier NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    [TagId] uniqueidentifier NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [OnlineOffline] nvarchar(10) NOT NULL,
    [BankMode] nvarchar(20) NULL,
    [Description] nvarchar(500) NULL,
    [Date] datetime2 NOT NULL,
    [IsMonitor] bit NOT NULL,
    [IsAutoDebit] bit NOT NULL,
    [TransferAccountId] uniqueidentifier NULL,
    [InvestmentId] uniqueidentifier NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Transactions_Accounts_AccountId] FOREIGN KEY ([AccountId]) REFERENCES [Accounts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Transactions_Accounts_TransferAccountId] FOREIGN KEY ([TransferAccountId]) REFERENCES [Accounts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Transactions_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Transactions_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]),
    CONSTRAINT [FK_Transactions_Tags_TagId] FOREIGN KEY ([TagId]) REFERENCES [Tags] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Transactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [FuelEntries] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [VehicleId] uniqueidentifier NOT NULL,
    [Date] datetime2 NOT NULL,
    [OdometerReading] decimal(18,2) NOT NULL,
    [FuelQuantity] decimal(18,2) NOT NULL,
    [FuelCost] decimal(18,2) NOT NULL,
    [PricePerLiter] decimal(18,2) NULL,
    [Notes] nvarchar(500) NULL,
    CONSTRAINT [PK_FuelEntries] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FuelEntries_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_FuelEntries_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [SIPHistories] (
    [Id] uniqueidentifier NOT NULL,
    [SIPId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [NavAtExecution] decimal(18,4) NULL,
    [ExecutedAt] datetime2 NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    [Notes] nvarchar(500) NULL,
    CONSTRAINT [PK_SIPHistories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SIPHistories_SIPs_SIPId] FOREIGN KEY ([SIPId]) REFERENCES [SIPs] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_Accounts_UserId] ON [Accounts] ([UserId]);
GO


CREATE INDEX [IX_AssetTransactions_InvestmentId] ON [AssetTransactions] ([InvestmentId]);
GO


CREATE INDEX [IX_Budgets_CategoryId] ON [Budgets] ([CategoryId]);
GO


CREATE INDEX [IX_Budgets_UserId] ON [Budgets] ([UserId]);
GO


CREATE INDEX [IX_Categories_UserId] ON [Categories] ([UserId]);
GO


CREATE UNIQUE INDEX [IX_Couples_InviteCode] ON [Couples] ([InviteCode]);
GO


CREATE INDEX [IX_Couples_OwnerId] ON [Couples] ([OwnerId]);
GO


CREATE INDEX [IX_Couples_PartnerId] ON [Couples] ([PartnerId]);
GO


CREATE INDEX [IX_Dividends_InvestmentId] ON [Dividends] ([InvestmentId]);
GO


CREATE INDEX [IX_FuelEntries_UserId] ON [FuelEntries] ([UserId]);
GO


CREATE INDEX [IX_FuelEntries_VehicleId] ON [FuelEntries] ([VehicleId]);
GO


CREATE INDEX [IX_Investments_UserId] ON [Investments] ([UserId]);
GO


CREATE INDEX [IX_PortfolioSnapshots_UserId] ON [PortfolioSnapshots] ([UserId]);
GO


CREATE INDEX [IX_Reminders_UserId] ON [Reminders] ([UserId]);
GO


CREATE INDEX [IX_SIPHistories_SIPId] ON [SIPHistories] ([SIPId]);
GO


CREATE INDEX [IX_SIPs_InvestmentId] ON [SIPs] ([InvestmentId]);
GO


CREATE INDEX [IX_SIPs_UserId] ON [SIPs] ([UserId]);
GO


CREATE INDEX [IX_Tags_UserId] ON [Tags] ([UserId]);
GO


CREATE INDEX [IX_Transactions_AccountId] ON [Transactions] ([AccountId]);
GO


CREATE INDEX [IX_Transactions_CategoryId] ON [Transactions] ([CategoryId]);
GO


CREATE INDEX [IX_Transactions_InvestmentId] ON [Transactions] ([InvestmentId]);
GO


CREATE INDEX [IX_Transactions_TagId] ON [Transactions] ([TagId]);
GO


CREATE INDEX [IX_Transactions_TransferAccountId] ON [Transactions] ([TransferAccountId]);
GO


CREATE INDEX [IX_Transactions_UserId] ON [Transactions] ([UserId]);
GO


CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO


CREATE INDEX [IX_Vehicles_UserId] ON [Vehicles] ([UserId]);
GO


