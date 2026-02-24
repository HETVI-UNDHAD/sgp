import React from "react";

function PollMessage({ msg, isOwnMessage }) {
  const [userVotes, setUserVotes] = React.useState({});

  // Safety check - if no poll data, return null
  if (!msg.poll || !msg.poll.question || !msg.poll.options || msg.poll.options.length === 0) {
    return null;
  }

  const handleVote = (optionIndex) => {
    setUserVotes((prev) => {
      const newVotes = { ...prev };
      if (newVotes[msg._id]) {
        // Remove previous vote
        const prevOption = msg.poll.options[newVotes[msg._id]];
        prevOption.votes = prevOption.votes.filter(
          (v) => v !== localStorage.getItem("userEmail")
        );
        prevOption.count--;
      }

      // Add new vote
      const newOption = msg.poll.options[optionIndex];
      newOption.votes.push(localStorage.getItem("userEmail"));
      newOption.count++;

      newVotes[msg._id] = optionIndex;
      return newVotes;
    });
  };

  const getTotalVotes = () => {
    return msg.poll.options.reduce((sum, opt) => sum + opt.count, 0);
  };

  const totalVotes = getTotalVotes();

  return (
    <div className={`poll-message ${isOwnMessage ? "own-poll" : "other-poll"}`}>
      <div className="poll-question">📊 {msg.poll.question}</div>

      <div className="poll-options">
        {msg.poll.options.map((option, index) => {
          const percentage =
            totalVotes > 0 ? ((option.count / totalVotes) * 100).toFixed(1) : 0;
          const isVoted = userVotes[msg._id] === index;

          return (
            <div
              key={index}
              className="poll-option"
              onClick={() => handleVote(index)}
            >
              <div className="option-bar">
                <div
                  className="option-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="option-text">
                <span className="option-name">{option.text}</span>
                <span className="option-stats">
                  {percentage}% ({option.count})
                </span>
              </div>
              {isVoted && <span className="vote-indicator">✓</span>}
            </div>
          );
        })}
      </div>

      <div className="poll-total-votes">{totalVotes} votes</div>

      <style>{`
        .poll-message {
          padding: 12px 14px;
          border-radius: 12px;
          margin: 10px 0;
        }

        .own-poll {
          background: linear-gradient(135deg, #34a853, #1f8e48);
          color: white;
        }

        .other-poll {
          background: white;
          color: #333;
        }

        .poll-question {
          font-weight: 600;
          margin-bottom: 12px;
        }

        .poll-options {
          margin-bottom: 10px;
        }

        .poll-option {
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 8px;
        }

        .poll-option:hover {
          opacity: 0.8;
        }

        .option-bar {
          width: 100%;
          height: 24px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .option-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          transition: width 0.2s;
        }

        .option-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .option-name {
          font-weight: 500;
        }

        .option-stats {
          opacity: 0.8;
          font-size: 11px;
        }

        .vote-indicator {
          margin-left: 4px;
          color: #0f0;
        }

        .poll-total-votes {
          text-align: center;
          font-size: 12px;
          opacity: 0.7;
          padding-top: 8px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default PollMessage;
