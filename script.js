document.addEventListener('DOMContentLoaded', () => {
    const nicknameContainer = document.getElementById('nickname-container');
    const todoContainer = document.getElementById('todo-container');
    const nicknameInput = document.getElementById('nickname-input');
    const startButton = document.getElementById('start-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    let currentUser = null;

    // Firestore 컬렉션 참조
    const todosRef = db.collection('todos');

    // 닉네임 입력 처리
    startButton.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (nickname) {
            currentUser = nickname;
            nicknameContainer.style.display = 'none';
            todoContainer.style.display = 'block';
            welcomeMessage.textContent = `${nickname}님 환영합니다!`;
            loadTodos();
        }
    });

    // 실시간 할일 목록 가져오기
    function loadTodos() {
        todosRef
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                todoList.innerHTML = '';
                snapshot.forEach((doc) => {
                    const todo = doc.data();
                    const li = document.createElement('li');
                    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                    li.innerHTML = `
                        <div class="content">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                            <span>${todo.text}</span>
                            <span class="user-info">- ${todo.userName}</span>
                        </div>
                        <div class="actions">
                            ${todo.userName === currentUser ? 
                                `<button class="delete-btn">삭제</button>` : ''}
                        </div>
                    `;

                    // 체크박스 이벤트 (작성자만 가능)
                    const checkbox = li.querySelector('input');
                    if (todo.userName === currentUser) {
                        checkbox.addEventListener('change', () => toggleTodo(doc.id, todo.completed));
                    } else {
                        checkbox.disabled = true;
                    }

                    // 삭제 버튼 이벤트
                    const deleteBtn = li.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => deleteTodo(doc.id));
                    }

                    todoList.appendChild(li);
                });
            });
    }

    // 할일 추가
    async function addTodo(text) {
        try {
            await todosRef.add({
                text,
                completed: false,
                userName: currentUser,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('할일 추가 중 오류 발생:', error);
        }
    }

    // 할일 삭제
    async function deleteTodo(id) {
        try {
            await todosRef.doc(id).delete();
        } catch (error) {
            console.error('할일 삭제 중 오류 발생:', error);
        }
    }

    // 할일 완료 토글
    async function toggleTodo(id, currentStatus) {
        try {
            await todosRef.doc(id).update({
                completed: !currentStatus
            });
        } catch (error) {
            console.error('할일 상태 변경 중 오류 발생:', error);
        }
    }

    // 폼 제출 이벤트
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const todoText = todoInput.value.trim();
        if (todoText && currentUser) {
            addTodo(todoText);
            todoInput.value = '';
        }
    });

    // 엔터키로 닉네임 입력
    nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startButton.click();
        }
    });
});
  
