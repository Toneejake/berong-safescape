import heapq
import numpy as np
import gymnasium as gym
from gymnasium import spaces
import cv2

# A* Pathfinding Algorithm
def a_star_search(grid, start, goal, fire_map=None):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    neighbors = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    close_set = set()
    came_from = {}
    gscore = {start: 0}
    fscore = {start: heuristic(start, goal)}
    oheap = []
    heapq.heappush(oheap, (fscore[start], start))
    
    while oheap:
        current = heapq.heappop(oheap)[1]
        if current == goal:
            data = []
            while current in came_from:
                data.append(current)
                current = came_from[current]
            data.reverse()
            return data
        close_set.add(current)
        for i, j in neighbors:
            neighbor = current[0] + i, current[1] + j
            tentative_g_score = gscore[current] + 1
            if 0 <= neighbor[0] < grid.shape[1] and 0 <= neighbor[1] < grid.shape[0]:
                if grid[neighbor[1]][neighbor[0]] == 1:
                    continue
                if fire_map is not None and fire_map[neighbor[1]][neighbor[0]] == 1:
                    continue
            else:
                continue
            if neighbor in close_set and tentative_g_score >= gscore.get(neighbor, 0):
                continue
            if tentative_g_score < gscore.get(neighbor, 0) or neighbor not in [i[1] for i in oheap]:
                came_from[neighbor] = current
                gscore[neighbor] = tentative_g_score
                fscore[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                heapq.heappush(oheap, (fscore[neighbor], neighbor))
    return []


# Fire Simulator Class
class FireSimulator:
    def __init__(self, grid, spread_probability=0.25, firewall_spread_factor=0.1):
        self.base_grid = grid
        self.spread_probability = spread_probability
        self.firewall_spread_factor = firewall_spread_factor
        self.fire_map = np.zeros_like(self.base_grid, dtype=float)
        self.directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def start_fire(self, ignition_points):
        for y, x in ignition_points:
            if 0 <= y < self.fire_map.shape[0] and 0 <= x < self.fire_map.shape[1]:
                self.fire_map[y, x] = 1

    def step(self):
        new_fire_map = self.fire_map.copy()
        rows, cols = self.fire_map.shape
        burning_cells = np.argwhere(self.fire_map == 1)

        for r, c in burning_cells:
            for dr, dc in self.directions:
                nr, nc = r + dr, c + dc

                if 0 <= nr < rows and 0 <= nc < cols:
                    if self.fire_map[nr, nc] == 0:
                        neighbor_type = self.base_grid[nr, nc]

                        current_spread_prob = self.spread_probability
                        if neighbor_type == 1:
                            current_spread_prob = 0
                        elif neighbor_type == 2:
                            current_spread_prob *= self.firewall_spread_factor

                        if np.random.rand() < current_spread_prob:
                            new_fire_map[nr, nc] = 1

        self.fire_map = new_fire_map

    def reset(self, ignition_points=None):
        self.fire_map = np.zeros_like(self.base_grid, dtype=float)
        if ignition_points:
            self.start_fire(ignition_points)

# Person Agent Class
class Person:
    def __init__(self, position):
        self.initial_pos = tuple(position)
        self.pos = list(position)
        self.path = []
        self.status = 'evacuating'
        self.state = 'CALM'
        self.speed = 1.0
        self.trip_probability = 0.0
        self.tripped_timer = 0
        self.PANIC_DISTANCE = 25
        self.ALERT_DISTANCE = 50

    def update_state(self, fire_map):
        if self.tripped_timer > 0:
            return
        fire_locations = np.argwhere(fire_map == 1)
        if len(fire_locations) == 0:
            min_dist = float('inf')
        else:
            agent_pos_yx = np.array([self.pos[1], self.pos[0]])
            min_dist = np.min(np.linalg.norm(fire_locations - agent_pos_yx, axis=1))

        if min_dist < self.PANIC_DISTANCE:
            self.state = 'PANICKED'
            self.speed = 1.5
            self.trip_probability = 0.1
        elif min_dist < self.ALERT_DISTANCE:
            self.state = 'ALERT'
            self.speed = 1.2
            self.trip_probability = 0.0
        else:
            self.state = 'CALM'
            self.speed = 1.0
            self.trip_probability = 0.0

    def move(self):
        if self.tripped_timer > 0:
            self.tripped_timer -= 1
            return
        if self.state == 'PANICKED':
            if np.random.rand() < self.trip_probability:
                self.tripped_timer = 5
                return
        steps_to_move = int(round(self.speed))
        for _ in range(steps_to_move):
            if self.path:
                self.pos = self.path.pop(0)
            else:
                break

    def check_status(self, fire_map, exits):
        if self.status != 'evacuating':
            return
        pos_int = (int(self.pos[1]), int(self.pos[0]))
        if fire_map[pos_int[0], pos_int[1]] == 1:
            self.status = 'burned'
            return
        for ex in exits:
            if np.linalg.norm(np.array(self.pos) - np.array(ex)) < 5:
                self.status = 'escaped'
                return

    def compute_path(self, grid, goal, fire_map):
        start_pos = (int(self.pos[0]), int(self.pos[1]))
        goal_pos = (int(goal[0]), int(goal[1]))
        self.path = a_star_search(grid, start_pos, goal_pos, fire_map)

    def reset(self):
        self.pos = list(self.initial_pos)
        self.path = []
        self.status = 'evacuating'
        self.state = 'CALM'
        self.speed = 1.0
        self.trip_probability = 0.0
        self.tripped_timer = 0

# Gymnasium Environment
class EvacuationEnv(gym.Env):
    def __init__(self, grid, num_agents=5, max_steps=500, agent_start_positions=None, fire_start_position=None, exits=None):
        super(EvacuationEnv, self).__init__()

        self.base_grid = grid
        self.num_agents = num_agents
        self.max_steps = max_steps
        self.initial_agent_positions = agent_start_positions
        self.initial_fire_position = fire_start_position
        self.initial_exits = exits

        self.exits = self._find_exits() if self.initial_exits is None else self.initial_exits
        if not self.exits:
            raise ValueError("No exits were found or provided. Cannot create environment.")

        self.fire_sim = FireSimulator(self.base_grid)
        self.agents = []

        self.action_space = spaces.Discrete(len(self.exits))

        fire_obs_shape = 64 * 64
        agent_pos_shape = self.num_agents * 2
        agent_state_shape = self.num_agents * 1
        obs_shape = fire_obs_shape + agent_pos_shape + agent_state_shape + 1
        self.observation_space = spaces.Box(low=0, high=1, shape=(obs_shape,), dtype=np.float32)

    def _find_exits(self):
        rows, cols = self.base_grid.shape
        exits = []
        for x in range(cols):
            if self.base_grid[1, x] == 0:
                exits.append((x, 1))
            if self.base_grid[rows-2, x] == 0:
                exits.append((x, rows-2))
        for y in range(rows):
            if self.base_grid[y, 1] == 0:
                exits.append((1, y))
            if self.base_grid[y, cols-2] == 0:
                exits.append((cols-2, y))
        if not exits:
            return []
        filtered_exits = [exits[0]]
        for ex in exits:
            if all(np.linalg.norm(np.array(ex) - np.array(f_ex)) > 20 for f_ex in filtered_exits):
                filtered_exits.append(ex)
        return filtered_exits

    def _get_observation(self):
        fire_map_resized = cv2.resize(self.fire_sim.fire_map.astype(np.float32), (64, 64), interpolation=cv2.INTER_AREA)
        fire_obs = fire_map_resized.flatten()

        agent_pos_obs = np.array([agent.pos for agent in self.agents]).flatten() / np.array([self.base_grid.shape[1], self.base_grid.shape[0]] * self.num_agents)

        state_map = {'CALM': 0.0, 'ALERT': 0.5, 'PANICKED': 1.0}
        agent_state_obs = np.array([state_map.get(agent.state, 0.0) for agent in self.agents])

        time_obs = np.array([self.current_step / self.max_steps])

        return np.concatenate([fire_obs, agent_pos_obs, agent_state_obs, time_obs]).astype(np.float32)

    def reset(self, seed=None):
        super().reset(seed=seed)
        self.current_step = 0

        fire_start = self.initial_fire_position or (self.base_grid.shape[0] // 2, self.base_grid.shape[1] // 2)
        self.fire_sim.reset(ignition_points=[fire_start])

        self.agents = []
        if self.initial_agent_positions:
            for pos in self.initial_agent_positions:
                self.agents.append(Person(position=pos))
        else:
            while len(self.agents) < self.num_agents:
                y, x = np.random.randint(0, self.base_grid.shape[0]), np.random.randint(0, self.base_grid.shape[1])
                if self.base_grid[y, x] == 0 and self.fire_sim.fire_map[y,x] == 0:
                    self.agents.append(Person(position=(x, y)))

        for agent in self.agents:
            agent.reset()

        return self._get_observation(), {}

    def step(self, action):
        self.current_step += 1

        self.fire_sim.step()

        target_exit = self.exits[action]
        reward = -0.01

        for agent in self.agents:
            if agent.status == 'evacuating':
                agent.update_state(self.fire_sim.fire_map)

                is_stuck_or_needs_path = not agent.path or (self.current_step % 10 == 0)
                if agent.state != 'PANICKED' and is_stuck_or_needs_path:
                    agent.compute_path(self.base_grid, target_exit, self.fire_sim.fire_map)

                agent.move()
                agent.check_status(self.fire_sim.fire_map, self.exits)

                if agent.status == 'escaped':
                    reward += 10
                elif agent.status == 'burned':
                    reward -= 10

        terminated = all(agent.status != 'evacuating' for agent in self.agents)
        truncated = self.current_step >= self.max_steps
        observation = self._get_observation()

        return observation, reward, terminated, truncated, {}
