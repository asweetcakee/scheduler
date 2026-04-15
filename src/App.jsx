const App = () => {
  return(
    <div>
      <header>
        Navigation and Controls
        - ViewSwitch component to toggle between different views (e.g., calendar, list, grid)
        - Date selection controls (e.g., date picker, next/previous buttons)
      </header>
      <main>
        Main Canvas - a vertical scrolling grid. Y-axis is time, X-axis for staff members
          - Each staff member has a column, and each time slot is a row
          - Appointment blocks are rendered as rectangles spanning the appropriate time slots and staff columns
          - Appointment blocks are color-coded based on shift type (e.g., morning, afternoon, night)
          - Appointment blocks display key information (e.g., client name, client number, appointment time, service type) and can be clicked for more details or editing and creating new appointments
        
        Time column
          - A fixed column on the left side of the grid that displays time intervals (e.g., every 30 minutes)
          - This column remains visible as the user scrolls vertically through the schedule
        
        Staff column
          - A fixed row at the top of the grid that displays staff member names
          - This row remains visible as the user scrolls horizontally through the schedule
        
        Status indicators
          - Hatched/Gray areas to indicate unavailable time slots (e.g., breaks, off-duty)
          - White areas to indicate available time slots
          - Colored blocks to indicate scheduled appointments, with different colors representing different types of appointments or clients

        Sidebar widget
          - Mini calendar for quick date navigation
      </main>
    </div>
  )
}

export default App;