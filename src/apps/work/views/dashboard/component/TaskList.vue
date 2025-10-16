<template>
  <div class='task-list-container'>
    <div class='task-table'>
      <h2 class='table-title'>Danh sách công việc chưa hoàn thành</h2>

      <table class='tasks-table'>
        <tbody>
          <tr
            v-for='task in tasks'
            :key='task.id'
            class='task-row'>
            <td class='task-number'>{{ task.id }}</td>
            <td class='task-name'>{{ task.name }}</td>
            <td
              class='task-due-date'
              :class='getDueDateClass(task.due_date)'>
              {{ task.due_date }}
            </td>
            <td class='task-progress'>
              <div
                class='progress-circle'
                :class='getProgressClass(task.progress)'>
                <div class='progress-inner'>
                  <span
                    v-if='task.progress === 100'
                    class='check-icon'>✓</span>
                  <span
                    v-else-if='task.progress === 0'
                    class='pause-icon'>⏸</span>
                  <span
                    v-else
                    class='progress-text'>{{ task.progress }}%</span>
                </div>
              </div>
            </td>
            <td class='task-avatar'>
              <div
                class='avatar-circle'
                :style='{ backgroundColor: getAvatarColor(task.id) }'>
                <span class='avatar-text'>{{ getAvatarInitial(task.name) }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// Reactive data
const tasks = ref([]);

// Methods
const getDueDateClass = (dueDate) => {
  if (dueDate.includes('Quá')) {
    return 'overdue';
  }
  return 'upcoming';
};

const getProgressClass = (progress) => {
  if (progress === 100) {
    return 'completed';
  }
  if (progress === 0) {
    return 'paused';
  }
  return 'in-progress';
};

const getAvatarColor = (id) => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];
  return colors[(id - 1) % colors.length];
};

const getAvatarInitial = (name) => {
  return name.charAt(0).toUpperCase();
};

// Initialize data
onMounted(() => {
  tasks.value = [
    {
      id: 1,
      name: 'Thiết kế kiến trúc tổng thể dự án Zamora',
      due_date: 'Còn 3 ngày',
      progress: 82
    },
    {
      id: 2,
      name: 'Thiết kế tổng thể và chi tiết cơ sở dữ liệu',
      due_date: 'Quá 2 ngày',
      progress: 0
    },
    {
      id: 3,
      name: 'Xây dựng giao diện UI/UX module quản trị hệ thống',
      due_date: 'Còn 1 ngày',
      progress: 82
    },
    {
      id: 4,
      name: 'Viết tài liệu hướng dẫn quản trị và vận hành hệ thống',
      due_date: 'Quá 5 ngày',
      progress: 82
    },
    {
      id: 5,
      name: 'Làm hồ sơ phân tích thiết kế kỹ thuật dự án vOffice',
      due_date: 'Còn 1 ngày',
      progress: 0
    },
    {
      id: 6,
      name: 'Lập kế hoạch triển khai HRM cho Vinafor',
      due_date: 'Còn 1 ngày',
      progress: 100
    },
    {
      id: 7,
      name: 'Làm hồ sơ thầu gói thầu HRM cho tổng HUD',
      due_date: 'Còn 1 ngày',
      progress: 100
    }
  ];
});
</script>

<style scoped>

.task-table {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid #e3f2fd;
}

.table-title {
  background-color: #e3f2fd;
  margin: 0;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
  border-bottom: 1px solid #bbdefb;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
}

.task-row {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
}

.task-row:hover {
  background-color: #f5f5f5;
}

.task-row:last-child {
  border-bottom: none;
}

.task-row td {
  padding: 10px 15px;
  vertical-align: middle;
}

.task-number {
  width: 32px;
  text-align: center;
  font-weight: 600;
  color: #666;
}

.task-name {
  min-width: 300px;
  color: #333;
  font-weight: 500;
}

.task-due-date {
  width: 100px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
}

.task-due-date.upcoming {
  color: #4caf50;
}

.task-due-date.overdue {
  color: #f44336;
}

.task-progress {
  width: 60px;
  text-align: center;
}

.progress-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.progress-circle.completed {
  background-color: #4caf50;
  color: white;
}

.progress-circle.paused {
  background-color: #9e9e9e;
  color: white;
}

.progress-circle.in-progress {
  background: conic-gradient(#4caf50 0deg, #4caf50 var(--progress-angle, 295deg), #e0e0e0 var(--progress-angle, 295deg));
  color: #333;
}

.progress-inner {
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.completed .progress-inner {
  background: #4caf50;
  color: white;
}

.paused .progress-inner {
  background: #9e9e9e;
  color: white;
}

.check-icon {
  font-size: 16px;
  font-weight: bold;
}

.pause-icon {
  font-size: 12px;
}

.progress-text {
  font-size: 8px;
}

.task-avatar {
  width: 50px;
  text-align: center;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.avatar-text {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

/* Dynamic progress angles */
.task-row:nth-child(1) .in-progress {
  --progress-angle: 295deg; /* 82% */
}

.task-row:nth-child(3) .in-progress {
  --progress-angle: 295deg; /* 82% */
}

.task-row:nth-child(4) .in-progress {
  --progress-angle: 295deg; /* 82% */
}

/* Responsive design */
@media (max-width: 768px) {
  .task-list-container {
    padding: 10px;
  }

  .task-name {
    min-width: 200px;
    font-size: 14px;
  }

  .task-due-date {
    width: 80px;
    font-size: 11px;
  }

  .progress-circle {
    width: 35px;
    height: 35px;
  }

  .progress-inner {
    width: 28px;
    height: 28px;
  }

  .avatar-circle {
    width: 28px;
    height: 28px;
  }

  .avatar-text {
    font-size: 12px;
  }
}
</style>