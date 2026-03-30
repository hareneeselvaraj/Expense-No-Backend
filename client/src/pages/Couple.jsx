import { useState, useContext } from 'react';
import { CoupleContext } from '../context/CoupleContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import './Couple.css'; // Creating standard styles or using vanilla CSS

export default function Couple() {
  const { couple, isCouple, refresh } = useContext(CoupleContext);
  const toast = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error('Email is required');
    setLoading(true);
    try {
      await api.post('/couple/create', { inviteEmail });
      toast.success('Invite sent!');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
    setLoading(false);
  };

  const handleAcceptInvite = async (e) => {
    e.preventDefault();
    if (!joinCode) return toast.error('Code is required');
    setLoading(true);
    try {
      await api.post('/couple/accept', { inviteCode: joinCode });
      toast.success('Successfully joined partner!');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    }
    setLoading(false);
  };

  const handleLeaveCouple = async () => {
    setLoading(true);
    try {
      await api.delete('/couple/leave');
      toast.success('Disconnected successfully');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave');
    }
    setLoading(false);
  };

  if (!couple) {
    // Solo state
    return (
      <div className="couple-page card">
        <h2>Couple Settings</h2>
        <p>Connect with your partner to share tracking and manage finances together.</p>

        <div className="couple-actions">
          <form onSubmit={handleCreateInvite} className="action-box">
            <h3>Invite Partner</h3>
            <input
              type="email"
              placeholder="Partner's email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={loading}
              className="input-field"
            />
            <button type="submit" disabled={loading} className="btn primary">Send Invite</button>
          </form>

          <div className="divider">OR</div>

          <form onSubmit={handleAcceptInvite} className="action-box">
            <h3>Have a code?</h3>
            <input
              type="text"
              placeholder="Enter 8-character code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              disabled={loading}
              className="input-field"
              maxLength={8}
            />
            <button type="submit" disabled={loading} className="btn secondary">Join Partner</button>
          </form>
        </div>
      </div>
    );
  }

  if (couple.status === 'Pending') {
    return (
      <div className="couple-page card pending-card">
        <h2>Invitation Pending</h2>
        <p>You have invited <strong>{couple.partnerEmail}</strong>. Waiting for them to accept.</p>

        <div className="invite-code-display">
          <span>Invite Code:</span>
          <div className="code-box">{couple.inviteCode}</div>
          <small>Your partner needs this code to accept the invitation.</small>
        </div>

        <button onClick={handleLeaveCouple} disabled={loading} className="btn danger">
          Cancel Invite
        </button>
      </div>
    );
  }

  if (isCouple) {
    return (
      <div className="couple-page card active-card">
        <h2>Shared Finances Active</h2>
        <div className="partner-details">
          <div className="avatar">{couple.partnerName.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{couple.partnerName}</h3>
            <p>{couple.partnerEmail}</p>
          </div>
        </div>

        <p className="success-text">Your accounts are linked. You can toggle between personal and shared data on the dashboard and budgets.</p>

        <button onClick={handleLeaveCouple} disabled={loading} className="btn danger mt-2">
          Dissolve Couple
        </button>
      </div>
    );
  }

  return null;
}
