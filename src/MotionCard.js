import React, { useState } from "react";

function MotionCard({ motion }) {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState("");
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    // Send to backend or update state
    console.log("Submit comment:", newComment);
    setNewComment("");
  };

 return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <p className="font-medium text-lg mb-1">{motion}</p>
      <p className="text-sm text-gray-500 mb-2">
        👍 {motion.upvotes} | 👎 {motion.downvotes}
      </p>

      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-600 text-sm underline mb-2"
      >
        {showComments ? "Hide Comments" : `View Comments (${motion.comments?.length || 0})`}
      </button>

      {showComments && (
        <div className="border-t pt-3 mt-2">
          <div className="max-h-32 overflow-y-auto mb-2">
            {motion.comments?.length ? (
              motion.comments.map((c, i) => (
                <p key={i} className="text-sm mb-1">• {c}</p>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet</p>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-grow border p-2 rounded text-sm"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );

}

export default MotionCard;
