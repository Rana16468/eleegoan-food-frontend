
const ConnectionStatus = ({ connected, isFixed = false }) => {
  return (
    <div className={`connection-status${isFixed ? ' connection-status--fixed' : ''}`} role="status" aria-live="polite">
      <div className={`connection-status__dot${connected ? ' is-connected' : ''}`} />
      <span>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;