import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAlert } from '../../../context/AlertContext';
import AddMemberModal from './modals/AddMemberModal';
import ChangeRoleModal from './modals/ChangeRoleModal';
import RemoveMemberModal from './modals/RemoveMemberModal';
import './MembersSidebar.css';

export default function MembersSidebar({ ledgerId, canManage, username }) {
  const { showAlert } = useAlert();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${ledgerId}/members`);
      setMembers(res.data);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [ledgerId]);

  if (loading) return <aside className="members-sidebar">Loading…</aside>;

  return (
    <aside className="members-sidebar">
      <h3>Members</h3>

      <div className="members-list">
        {members.map((m) => (
          <div key={m.id} className={`member-card ${m.username === username ? "selected" : ""}`}>
            <div className="member-info">
              <strong>{m.full_name}</strong>
              <span>@{m.username}</span>
            </div>

            <div className="member-actions">
              <span className={`role ${m.role}`}>{m.role}</span>

              {(canManage && username !== m.username) && (
                <button
                  className="dots-btn"
                  onClick={() => {
                    setSelectedMember(m);
                    setShowChangeRole(true);
                  }}
                >
                  ⋮
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {canManage && (
        <button
          className="add-member-btn"
          onClick={() => setShowAdd(true)}
        >
          + Add Member
        </button>
      )}

      {/* MODALS */}
      {showAdd && (
        <AddMemberModal
          ledgerId={ledgerId}
          onClose={() => setShowAdd(false)}
          onSuccess={fetchMembers}
        />
      )}

      {showChangeRole && selectedMember && (
        <ChangeRoleModal
          ledgerId={ledgerId}
          member={selectedMember}
          onClose={() => setShowChangeRole(false)}
          onRemove={() => {
            setShowChangeRole(false);
            setShowRemove(true);
          }}
          onSuccess={fetchMembers}
        />
      )}

      {showRemove && selectedMember && (
        <RemoveMemberModal
          ledgerId={ledgerId}
          member={selectedMember}
          onClose={() => setShowRemove(false)}
          onSuccess={fetchMembers}
        />
      )}
    </aside>
  );
}
