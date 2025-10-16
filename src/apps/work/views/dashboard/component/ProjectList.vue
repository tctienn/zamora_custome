<template>
  <div class='project-list-container surface-0' >
    <div class='project-table'>
      <h2 class='table-title'>Danh sách các dự án liên quan</h2>

      <table class='projects-table'>
        <tbody>
          <tr
            v-for='project in projects'
            :key='project.id'
            class='project-row'>
            <td class='project-number'>{{ project.id }}</td>
            <td class='project-name'>{{ project.name }}</td>
            <td class='project-progress'>{{ project.completed_tasks }}/{{ project.total_tasks }}</td>
            <td class='progress-bar-container'>
              <div class='progress-wrapper'>
                <div class='progress-bar'>
                  <div
                    class='progress-fill'
                    :class='getProgressClass(project.percentage)'
                    :style="{ width: project.percentage + '%' }"></div>
                </div>
                <span class='progress-percentage'>{{ project.percentage }}%</span>
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
const projects = ref([]);

// Methods
const getProgressClass = (percentage) => {
  if (percentage >= 80) {
    return 'progress-high';
  }
  if (percentage >= 60) {
    return 'progress-medium';
  }
  if (percentage >= 40) {
    return 'progress-low';
  }
  return 'progress-very-low';
};

// Initialize data
onMounted(() => {
  projects.value = [
    {
      id: 1,
      name: 'Nền tảng quản trị và điều hành doanh nghiệp Zamora',
      completed_tasks: 40,
      total_tasks: 80,
      percentage: 60
    },
    {
      id: 2,
      name: 'Phần mềm quản lý nhân sự Z.HRM',
      completed_tasks: 40,
      total_tasks: 120,
      percentage: 35
    },
    {
      id: 3,
      name: 'Hệ thống văn phòng điện tử Z.Office',
      completed_tasks: 35,
      total_tasks: 90,
      percentage: 40
    },
    {
      id: 4,
      name: 'Hệ thống quản lý tài liệu nội bộ Z.MyBox',
      completed_tasks: 70,
      total_tasks: 95,
      percentage: 85
    },
    {
      id: 5,
      name: 'Dự án quản lý cấp chứng nhận đầu tư Z.OneGate',
      completed_tasks: 30,
      total_tasks: 80,
      percentage: 40
    },
    {
      id: 6,
      name: 'Xây dựng cổng thông tin doanh nghiệp Z.BusinessPortal',
      completed_tasks: 30,
      total_tasks: 85,
      percentage: 40
    },
    {
      id: 7,
      name: 'Hệ thống dịch vụ công một cửa điện tử Z.eGate',
      completed_tasks: 70,
      total_tasks: 70,
      percentage: 100
    }
  ];
});
</script>

<style scoped>
.project-list-container {
}

.project-table {
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

.projects-table {
  width: 100%;
  border-collapse: collapse;
}

.project-row {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
  height: 50px;
}

.project-row:hover {
  background-color: #f5f5f5;
}

.project-row:last-child {
  border-bottom: none;
}

.project-row td {
  padding: 12px 15px;
  vertical-align: middle;
}

.project-number {
  width: 40px;
  text-align: center;
  font-weight: 600;
  color: #666;
}

.project-name {
  min-width: 300px;
  color: #333;
  font-weight: 500;
}

.project-progress {
  width: 80px;
  text-align: center;
  color: #1976d2;
  font-weight: 600;
}

.progress-bar-container {
  width: 200px;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-high {
  background-color: #4caf50;
}

.progress-medium {
  background-color: #8bc34a;
}

.progress-low {
  background-color: #ff9800;
}

.progress-very-low {
  background-color: #8bc34a;
}

.progress-percentage {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  min-width: 35px;
  text-align: right;
}

/* Responsive design */
@media (max-width: 768px) {
  .project-list-container {
    padding: 10px;
  }

  .project-name {
    min-width: 200px;
    font-size: 14px;
  }

  .progress-bar-container {
    width: 150px;
  }

  .progress-wrapper {
    flex-direction: column;
    gap: 5px;
  }

  .progress-percentage {
    text-align: center;
  }
}
</style>