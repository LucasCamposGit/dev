document.addEventListener('DOMContentLoaded', () => {
    const tweetInput = document.getElementById("tweetInput");
    const postBtn = document.getElementById("postBtn");
    const notesContainer = document.getElementById("notesContainer");
    const charCount = document.getElementById("charCount");
  
    tweetInput.addEventListener("input", () => {
      charCount.textContent = `${tweetInput.value.length} / 280`;
    });
  
    async function fetchNotes() {
      try {
        const response = await fetch('/api/notes');
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
      }
    }
  
    async function fetchReplies(noteId) {
      try {
        const response = await fetch(`/api/notes/${noteId}/replies`);
        if (!response.ok) {
          throw new Error('Failed to fetch replies');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching replies:', error);
        return [];
      }
    }
  
    async function createNote(text, parentId = null) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text, parent_id: parentId })
        });
  
        if (!response.ok) {
          throw new Error('Failed to create note');
        }
        return await response.json();
      } catch (error) {
        console.error('Error creating note:', error);
        return null;
      }
    }
  
    async function deleteNote(id) {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete note');
        }
        return await response.json();
      } catch (error) {
        console.error('Error deleting note:', error);
        return null;
      }
    }
  
    function hideAllRepliesContainers() {
      document.querySelectorAll(".replies-container").forEach(container => {
        container.classList.remove("max-h-[1000px]");
        container.classList.add("max-h-0");
        const svg = container.previousSibling.querySelector("svg");
        if (svg) svg.classList.remove("rotate-180");
      });
    }
  
    async function loadNotes() {
      notesContainer.innerHTML = '<div class="text-center"><p>Loading notes...</p></div>';
      const notes = await fetchNotes();
      
      notesContainer.innerHTML = '';
      
      if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="text-center text-gray-500"><p>No notes yet. Be the first to post!</p></div>';
        return;
      }
  
      for (const note of notes) {
        const noteDiv = document.createElement("div");
        noteDiv.className = "bg-gray-800 p-4 rounded-lg shadow relative";
  
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "absolute top-2 right-2 text-red-500 hover:text-red-700";
        deleteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
        deleteBtn.onclick = async () => {
          await deleteNote(note.id);
          loadNotes();
        };
        noteDiv.appendChild(deleteBtn);
  
        const noteText = document.createElement("p");
        noteText.className = "text-lg text-gray-200";
        noteText.textContent = note.text;
        noteDiv.appendChild(noteText);
  
        const btnRow = document.createElement("div");
        btnRow.className = "flex items-center space-x-4 mt-2";
  
        const replyBtn = document.createElement("button");
        replyBtn.className = "text-sm text-blue-400 hover:underline";
        replyBtn.textContent = "Reply";
        replyBtn.onclick = () => showReplyBox(note.id, noteDiv);
  
        const toggleRepliesBtn = document.createElement("button");
        toggleRepliesBtn.className = "text-sm text-gray-400 flex items-center";
        toggleRepliesBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        `;
  
        btnRow.appendChild(replyBtn);
        btnRow.appendChild(toggleRepliesBtn);
        noteDiv.appendChild(btnRow);
  
        const repliesContainer = document.createElement("div");
        repliesContainer.className = "replies-container transition-all max-h-0 overflow-hidden mt-2 border-l-2 border-blue-500 pl-4";
        noteDiv.appendChild(repliesContainer);
  
        // Fetch and load replies
        const replies = await fetchReplies(note.id);
        
        if (replies.length > 0) {
          const countDiv = document.createElement("div");
          countDiv.className = "text-sm text-gray-400 mt-1";
          countDiv.textContent = `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`;
          noteDiv.insertBefore(countDiv, btnRow);
        }
  
        replies.forEach(reply => {
          const replyDiv = document.createElement("div");
          replyDiv.className = "mt-3 relative";
  
          const replyText = document.createElement("p");
          replyText.className = "text-gray-100";
          replyText.textContent = reply.text;
          replyDiv.appendChild(replyText);
  
          const replyDeleteBtn = document.createElement("button");
          replyDeleteBtn.className = "absolute top-0 right-0 text-red-500 hover:text-red-700";
          replyDeleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          `;
          replyDeleteBtn.onclick = async () => {
            await deleteNote(reply.id);
            loadNotes();
          };
  
          replyDiv.appendChild(replyDeleteBtn);
          repliesContainer.appendChild(replyDiv);
        });
  
        toggleRepliesBtn.onclick = () => {
          const svg = toggleRepliesBtn.querySelector("svg");
          const isOpen = repliesContainer.classList.contains("max-h-[1000px]");
          
          if (isOpen) {
            repliesContainer.classList.remove("max-h-[1000px]");
            repliesContainer.classList.add("max-h-0");
            svg.classList.remove("rotate-180");
          } else {
            hideAllRepliesContainers();
            repliesContainer.classList.remove("max-h-0");
            repliesContainer.classList.add("max-h-[1000px]");
            svg.classList.add("rotate-180");
          }
        };
  
        notesContainer.appendChild(noteDiv);
      }
    }
  
    function showReplyBox(parentId, parentElement) {
      const existing = parentElement.querySelector("textarea");
      if (existing) return;
  
      const replyInput = document.createElement("textarea");
      replyInput.className = "w-full p-2 border border-gray-600 bg-gray-900 text-white rounded mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500";
      replyInput.rows = 2;
      replyInput.placeholder = "Reply...";
  
      const replyCounter = document.createElement("div");
      replyCounter.className = "text-right text-sm text-gray-400 mt-1";
      replyCounter.textContent = "0 / 280";
  
      replyInput.addEventListener("input", () => {
        replyCounter.textContent = `${replyInput.value.length} / 280`;
      });
  
      const replyPostBtn = document.createElement("button");
      replyPostBtn.className = "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mt-2";
      replyPostBtn.textContent = "Post Reply";
      
      replyPostBtn.onclick = async () => {
        const text = replyInput.value.trim();
        if (text) {
          await createNote(text, parentId);
          loadNotes();
          
          // Auto open replies for this parent after a short delay to allow DOM to update
          setTimeout(() => {
            const noteElements = document.querySelectorAll("#notesContainer > div");
            for (const noteElem of noteElements) {
              if (noteElem.querySelector("p.text-lg").textContent === parentElement.querySelector("p.text-lg").textContent) {
                const repliesContainer = noteElem.querySelector(".replies-container");
                const toggleBtn = repliesContainer.previousSibling.querySelector("svg");
                
                hideAllRepliesContainers();
                repliesContainer.classList.remove("max-h-0");
                repliesContainer.classList.add("max-h-[1000px]");
                toggleBtn.classList.add("rotate-180");
                break;
              }
            }
          }, 100);
        }
      };
  
      parentElement.appendChild(replyInput);
      parentElement.appendChild(replyCounter);
      parentElement.appendChild(replyPostBtn);
    }
  
    postBtn.addEventListener("click", async () => {
      const text = tweetInput.value.trim();
      if (text) {
        await createNote(text);
        tweetInput.value = "";
        charCount.textContent = "0 / 280";
        loadNotes();
      }
    });
  
    // Initial load
    loadNotes();
  });