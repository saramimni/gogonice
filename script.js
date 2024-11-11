document.addEventListener('DOMContentLoaded', () => {
    // 기존 Firebase 관련 코드는 유지...

    // 시계 기능
    function updateClock() {
        const now = new Date();
        const clock = document.getElementById('clock');
        const dateDisplay = document.getElementById('date');
        
        clock.textContent = now.toLocaleTimeString('ko-KR');
        dateDisplay.textContent = now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    setInterval(updateClock, 1000);
    updateClock();

    // 나이스 API 호출 함수
    async function fetchSchoolSchedule() {
        const url = 'https://open.neis.go.kr/hub/SchoolSchedule';
        const params = new URLSearchParams({
            ATPT_OFCDC_SC_CODE: 'J10',
            SD_SCHUL_CODE: '7530475',
            Type: 'json',
            pSize: 100
        });

        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            return data.SchoolSchedule[1].row;
        } catch (error) {
            console.error('일정 가져오기 실패:', error);
            return [];
        }
    }

    // 일정 표시 함수
    async function displaySchedule() {
        const schedules = await fetchSchoolSchedule();
        const todayEvents = document.getElementById('today-events');
        const weekEvents = document.getElementById('week-events');
        
        const today = new Date();
        const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        todayEvents.innerHTML = '';
        weekEvents.innerHTML = '';

        schedules.forEach(schedule => {
            const eventDate = new Date(schedule.AA_YMD);
            const eventElement = `
                <div class="event-item">
                    <div class="event-date">${eventDate.toLocaleDateString()}</div>
                    <div class="event-content">${schedule.EVENT_NM}</div>
                </div>
            `;

            if (eventDate.toDateString() === today.toDateString()) {
                todayEvents.innerHTML += eventElement;
            }

            if (eventDate >= today && eventDate <= oneWeekLater) {
                weekEvents.innerHTML += eventElement;
            }
        });
    }

    // Todo 항목 추가 함수 수정
    async function addTodo(text, deadline) {
        try {
            await todosRef.add({
                text,
                completed: false,
                userName: currentUser,
                deadline: deadline,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('할일 추가 중 오류 발생:', error);
        }
    }

    // 폼 제출 이벤트 수정
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const todoText = todoInput.value.trim();
        const deadline = document.getElementById('deadline-input').value;
        
        if (todoText && deadline && currentUser) {
            addTodo(todoText, deadline);
            todoInput.value = '';
            document.getElementById('deadline-input').value = '';
        }
    });

    // 초기 실행
    displaySchedule();
    setInterval(displaySchedule, 1000 * 60 * 60); // 1시간마다 업데이트
});
