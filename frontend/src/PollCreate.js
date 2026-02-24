import React, { useState } from "react";

function PollCreate({ groupId, userName, userEmail, userId, onPollCreate }) {
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const handleAddOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      alert("Poll question is required");
      return;
    }

    const validOptions = pollOptions.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      alert("Poll needs at least 2 options");
      return;
    }

    const poll = {
      question: pollQuestion,
      options: validOptions.map((text) => ({
        text,
        votes: [],
        count: 0,
      })),
      createdBy: userId,
      createdAt: new Date(),
    };

    onPollCreate({
      poll,
      sender: userId,
      senderName: userName,
      senderEmail: userEmail,
      groupId: groupId,
    });

    // Reset form
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollForm(false);
  };

  if (!showPollForm) {
    return (
      <button
        type="button"
        onClick={() => setShowPollForm(true)}
        className="poll-create-button"
        style={{ display: "none" }}
      >
        Create Poll
      </button>
    );
  }

  return (
    <div className="poll-form-container">
      <div className="poll-form">
        <h3>Create a Poll</h3>

        <div className="form-group">
          <label>Question:</label>
          <input
            type="text"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Enter poll question..."
            className="poll-input"
          />
        </div>

        <div className="form-group">
          <label>Options:</label>
          {pollOptions.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="poll-option-input"
              />
              {pollOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="remove-option-btn"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {pollOptions.length < 5 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="add-option-btn"
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="poll-form-buttons">
          <button
            type="button"
            onClick={handleCreatePoll}
            className="poll-submit-btn"
          >
            Create Poll
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPollForm(false);
              setPollQuestion("");
              setPollOptions(["", ""]);
            }}
            className="poll-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .poll-form-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .poll-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .poll-form h3 {
          margin: 0 0 20px 0;
          color: #0b3e71;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }

        .poll-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .option-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          align-items: center;
        }

        .poll-option-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .remove-option-btn {
          padding: 8px 12px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .add-option-btn {
          padding: 8px 16px;
          background: #0b3e71;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
          margin-top: 10px;
        }

        .poll-form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .poll-submit-btn {
          flex: 1;
          padding: 12px;
          background: #34a853;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .poll-submit-btn:hover {
          background: #2d8e47;
        }

        .poll-cancel-btn {
          flex: 1;
          padding: 12px;
          background: #ddd;
          color: #333;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .poll-cancel-btn:hover {
          background: #ccc;
        }
      `}</style>
    </div>
  );
}

export default PollCreate;
