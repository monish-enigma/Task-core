import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import NeonButton from "./Neon";

const USERS = [
  { id: 1, name: "Monish" },
  { id: 2, name: "Steve" },
  { id: 3, name: "Charles" },
  { id: 4, name: "Martin" },
  { id: 5, name: "Karen" },
];

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];
const STORY_POINTS = [1, 2, 3, 5, 8]; // Fibonacci scale

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: "", assigned: [], storyPoints: 1 });
  const [subtaskInputs, setSubtaskInputs] = useState({}); // {taskId: {name, users, storyPoints}}

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/tasks");
    setTasks(res.data);
  };

  // --- Task CRUD ---
  const addTask = async () => {
    if (!newTask.name) return;
    const task = {
      id: Date.now(),
      taskName: newTask.name,
      assignedUserIds: newTask.assigned,
      storyPoints: newTask.storyPoints,
      status: "Not Started",
      history: [],
      subtasks: [],
    };
    await axios.post("http://localhost:5000/tasks", task);
    setNewTask({ name: "", assigned: [], storyPoints: 1 });
    fetchTasks();
  };

  const updateTaskStatus = async (taskId, status) => {
    const task = tasks.find((t) => t.id === taskId);
    task.history.push({ status, timestamp: new Date().toLocaleString() });
    await axios.put(`http://localhost:5000/tasks/${taskId}`, { status, history: task.history });
    fetchTasks();
  };

  const deleteTask = async (taskId) => {
    await axios.delete(`http://localhost:5000/tasks/${taskId}`);
    fetchTasks();
  };

  // --- Subtask CRUD ---
  const addSubtask = async (taskId) => {
    const input = subtaskInputs[taskId];
    if (!input || !input.name) return;

    const subtask = {
      id: Date.now(),
      taskName: input.name,
      assignedUserIds: input.users || [],
      storyPoints: input.storyPoints || 1,
      status: "Not Started",
      history: [],
    };
    await axios.post(`http://localhost:5000/tasks/${taskId}/subtasks`, subtask);
    setSubtaskInputs({ ...subtaskInputs, [taskId]: { name: "", users: [], storyPoints: 1 } });
    fetchTasks();
  };

  const updateSubtaskStatus = async (taskId, subtaskId, status) => {
    const task = tasks.find((t) => t.id === taskId);
    const subtask = task.subtasks.find((st) => st.id === subtaskId);
    subtask.history.push({ status, timestamp: new Date().toLocaleString() });
    await axios.put(`http://localhost:5000/tasks/${taskId}/subtasks/${subtaskId}`, {
      status,
      history: subtask.history,
    });
    fetchTasks();
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    await axios.delete(`http://localhost:5000/tasks/${taskId}/subtasks/${subtaskId}`);
    fetchTasks();
  };

  // --- Helpers ---
  const getUserNames = (ids) =>
    USERS.filter((u) => ids.includes(u.id)).map((u) => u.name).join(", ");

  const getTotalStoryPoints = (task) =>
    (task.storyPoints || 0) + task.subtasks.reduce((sum, st) => sum + (st.storyPoints || 0), 0);

  // Reporting calculations
  const reportByStatus = STATUS_OPTIONS.map((status) => ({
    status,
    points: tasks.reduce(
      (sum, t) =>
        sum +
        (t.status === status ? t.storyPoints : 0) +
        t.subtasks.filter((st) => st.status === status).reduce((s, st) => s + (st.storyPoints || 0), 0),
      0
    ),
  }));

  const reportByAssignee = USERS.map((user) => ({
    user: user.name,
    points: tasks.reduce(
      (sum, t) =>
        sum +
        (t.assignedUserIds.includes(user.id) ? t.storyPoints : 0) +
        t.subtasks.reduce(
          (s, st) => s + (st.assignedUserIds.includes(user.id) ? st.storyPoints : 0),
          0
        ),
      0
    ),
  }));

  return (
    <Box sx={{ p: 4, bgcolor: "#1f1f2f", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" color="#e0e0e0" gutterBottom>
        Task Dashboard
      </Typography>
      {/* Top row: Add Task + Reporting */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, flexWrap: "wrap" }}>
        <NeonButton/>
        {/* Add Task */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Task Name"
            variant="outlined"
            size="small"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            sx={{ bgcolor: "#2a2a3f", input: { color: "#e0e0e0" }, width: 250 }}
          />
          <FormControl sx={{ minWidth: 180, bgcolor: "#2a2a3f" }}>
            <InputLabel sx={{ color: "#aaa" }}>Assign Users</InputLabel>
            <Select
              multiple
              value={newTask.assigned}
              onChange={(e) => setNewTask({ ...newTask, assigned: e.target.value })}
              sx={{ color: "#e0e0e0" }}
            >
              {USERS.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 100, bgcolor: "#2a2a3f" }}>
            <InputLabel sx={{ color: "#aaa" }}>Story Points</InputLabel>
            <Select
              value={newTask.storyPoints}
              onChange={(e) => setNewTask({ ...newTask, storyPoints: e.target.value })}
              sx={{ color: "#e0e0e0" }}
            >
              {STORY_POINTS.map((sp) => <MenuItem key={sp} value={sp}>{sp}</MenuItem>)}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            onClick={addTask}
            sx={{
              bgcolor: "#4b6cb7",
              ":hover": { bgcolor: "#3a549a" },
              borderRadius: 3,
              px: 3,
            }}
          >
            Add Task
          </Button>
        </Stack>
            
        {/* Reporting Panel */}
        <Paper
          sx={{
            bgcolor: "#2a2a3f",
            color: "#e0e0e0",
            p: 2,
            borderRadius: 2,
            minWidth: 200,
            mt: { xs: 2, sm: 0 },
          }}
          elevation={3}
        >
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Reporting
          </Typography>
          <Typography variant="body2" mb={1}>
            <strong>By Status:</strong>
          </Typography>
          {reportByStatus.map((r) => (
            <Typography key={r.status} variant="body2">
              {r.status}: {r.points} pts
            </Typography>
          ))}
          <Typography variant="body2" mt={1} mb={1}>
            <strong>By Assignee:</strong>
          </Typography>
          {reportByAssignee.map((r) => (
            <Typography key={r.user} variant="body2">
              {r.user}: {r.points} pts
            </Typography>
          ))}
        </Paper>
      </Box>

      {/* Tasks Table */}
      <Table sx={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#e0e0e0" }}>Task</TableCell>
            <TableCell sx={{ color: "#e0e0e0" }}>Assigned To</TableCell>
            <TableCell sx={{ color: "#e0e0e0" }}>Status</TableCell>
            <TableCell sx={{ color: "#e0e0e0" }}>Story Points</TableCell>
            <TableCell sx={{ color: "#e0e0e0" }}>Total Points</TableCell>
            <TableCell sx={{ color: "#e0e0e0" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              <TableRow sx={{ bgcolor: "#2a2a3f", borderRadius: 2 }}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="#e0e0e0">
                    {task.taskName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {task.assignedUserIds.map((id) => {
                      const user = USERS.find((u) => u.id === id);
                      return user ? <Chip key={id} label={user.name} size="small" sx={{ bgcolor: "#3a3a5c", color: "#fff" }} /> : null;
                    })}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    sx={{ bgcolor: "#3a3a5c", color: "#fff", borderRadius: 1, minWidth: 120 }}
                  >
                    {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>{task.storyPoints}</TableCell>
                <TableCell>{getTotalStoryPoints(task)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => deleteTask(task.id)}
                    sx={{ bgcolor: "#b74b4b",color:"white", ":hover": { bgcolor: "#933636" } }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>

              {/* Subtasks */}
              {task.subtasks.map((st) => (
                <TableRow key={st.id} sx={{ bgcolor: "#3a3a5c" }}>
                  <TableCell sx={{ pl: 5 }}>
                    <Typography color="#ccc">↳ {st.taskName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {st.assignedUserIds.map((id) => {
                        const user = USERS.find((u) => u.id === id);
                        return user ? <Chip key={id} label={user.name} size="small" sx={{ bgcolor: "#555577", color: "#fff" }} /> : null;
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={st.status}
                      onChange={(e) => updateSubtaskStatus(task.id, st.id, e.target.value)}
                      sx={{ bgcolor: "#555577", color: "#fff", borderRadius: 1, minWidth: 120 }}
                    >
                      {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell>{st.storyPoints}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => deleteSubtask(task.id, st.id)}
                      sx={{ bgcolor: "#b74b4b", color: "white", ":hover": { bgcolor: "#933636" } }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add Subtask Row */}
              <TableRow sx={{ bgcolor: "#2a2a3f" }}>
                <TableCell sx={{ pl: 5 }}>
                  <TextField
                    placeholder="New Subtask Name"
                    variant="outlined"
                    size="small"
                    value={subtaskInputs[task.id]?.name || ""}
                    onChange={(e) => setSubtaskInputs({
                      ...subtaskInputs,
                      [task.id]: { ...subtaskInputs[task.id], name: e.target.value }
                    })}
                    sx={{ bgcolor: "#3a3a5c", input: { color: "#e0e0e0" }, width: 200 }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    multiple
                    value={subtaskInputs[task.id]?.users || []}
                    onChange={(e) => setSubtaskInputs({
                      ...subtaskInputs,
                      [task.id]: { ...subtaskInputs[task.id], users: e.target.value }
                    })}
                    displayEmpty
                    sx={{ bgcolor: "#3a3a5c", color: "#e0e0e0", minWidth: 150 }}
                  >
                    {USERS.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={subtaskInputs[task.id]?.storyPoints || 1}
                    onChange={(e) => setSubtaskInputs({
                      ...subtaskInputs,
                      [task.id]: { ...subtaskInputs[task.id], storyPoints: e.target.value }
                    })}
                    sx={{ bgcolor: "#3a3a5c", color: "#e0e0e0", borderRadius: 1, minWidth: 80 }}
                  >
                    {STORY_POINTS.map((sp) => <MenuItem key={sp} value={sp}>{sp}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell colSpan={2}>
                  <Button
                    size="small"
                    onClick={() => addSubtask(task.id)}
                    sx={{ bgcolor: "#4b6cb7", color: "white", ":hover": { bgcolor: "#3a549a" }, borderRadius: 3 }}
                  >
                    Add Subtask
                  </Button>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Dashboard;
