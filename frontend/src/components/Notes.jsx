import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

const Notes = ({ nodeSelected, userId, nodeVersion }) => {
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState("");
  const [isReflection, setIsReflection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const notesEndRef = useRef(null);

  const token = Cookies.get("token");

  // Function to fetch notes
  const fetchNotes = async () => {
    if (!nodeSelected) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/get-Notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nodeId: nodeSelected.id, version: nodeVersion }),
      });

      const result = await response.json();
      if (response.ok) {
        setNotes(result.notes || []);
      } else {
        setMessage(result.message || "Error retrieving the notes.");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setMessage("An error occurred while fetching the notes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes when the component mounts or when nodeSelected or nodeVersion changes
  useEffect(() => {
    fetchNotes();
  }, [nodeSelected, nodeVersion, token]);

  // Scroll to the bottom of the notes box when notes update
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  // Function to render note content (either text or file)
  const renderNoteContent = (note) => {
    if (note.contentType === "text") {
      return <p>{note.content}</p>;
    } else if (note.contentType === "file") {
      // Check if it's an image or video based on the file type
      const videoExtensions = ['mp4', 'mov', 'avi']; // Add other video types if needed
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Add other image types if needed
  
      const fileType = note.content.split('.').pop().toLowerCase();
  
      if (imageExtensions.includes(fileType)) {
        // Render image for supported image formats
        return (
          <img
            src={`http://localhost:3000/uploads/${note.content}`}
            alt="Note"
            style={{ maxWidth: "300px", display: "block", marginTop: "10px" }}
          />
        );
      } else if (videoExtensions.includes(fileType)) {
        // Render video for supported video formats
        return (
          <video
            controls
            style={{ maxWidth: "300px", display: "block", marginTop: "10px" }}
          >
            <source
              src={`http://localhost:3000/uploads/${note.content}`}
              type={`video/${fileType}`}
            />
            Your browser does not support the video tag.
          </video>
        );
      }
      return null; // Return null if file type is not recognized
    }
    return null;
  };
  
  const handleTextSubmit = async (e) => {
    e.preventDefault();

    if (!nodeSelected) {
      setMessage("No Node Selected.");
      return;
    }

    if (!noteContent.trim()) {
      setMessage("Please write a note before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/create-Note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: noteContent,
          contentType: "text",
          userId,
          nodeId: nodeSelected.id,
          version: nodeVersion,
          isReflection,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setNoteContent("");
        setIsReflection(false);
        fetchNotes(); // Refetch notes after successful submission
      } else {
        setMessage(result.message || "Error creating the note.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while creating the note.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!nodeSelected) {
      setMessage("No Node Selected.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentType", "file");
    formData.append("userId", userId);
    formData.append("nodeId", nodeSelected.id);
    formData.append("version", nodeVersion);
    formData.append("isReflection", isReflection);

    try {
      const response = await fetch("http://localhost:3000/create-Note", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchNotes(); // Refetch notes after successful upload
      } else {
        setMessage(result.message || "Error uploading the file.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Notes and Reflections</h3>
     
      {/* Display Notes */}
      <div style={{ maxHeight: "400px", maxWidth: "600px", overflowY: "scroll", border: "1px solid #ccc", marginTop: "20px" }}>
        {loading ? (
          <p>Loading notes...</p>
        ) : (
          <div>
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note._id} style={{ marginBottom: "5px" }}>
                  <p>
                  <strong>
                      {note.username}
                      
                      {note.isReflection && <span> (Reflection)</span>}:
                    </strong>
                    {note.createdAt}
                  </p>
                  <div style={{ maxWidth: "100%" }}>
                    {renderNoteContent(note)}
                    
                  </div>
                </div>
              ))
            ) : (
              <p>No notes available for this node.</p>
            )}
            <div ref={notesEndRef} />
          </div>
        )}
      </div>

      {!nodeSelected ? (
        <p>No Node Selected.</p>
      ) : (
        <>
          {/* Text Input for Notes */}
          <form onSubmit={handleTextSubmit}>
            <div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                rows={5}
                style={{ width: "100%" }}
              />
            </div>

            {/* Reflection Checkbox */}
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isReflection}
                  onChange={(e) => setIsReflection(e.target.checked)}
                />
                Is this a reflection?
              </label>
            </div>

            {/* Submit Button for Text */}
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>

          {/* File Upload */}
          <div>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>
          
      {/* Status Message */}
      {message && <p>{message}</p>}
        </>
      )}


    </div>
  );
};

export default Notes;
