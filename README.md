# C-LR(1) Parser

## Project Description

This project is a C-LR(1) parser, which is a type of parser used in compiler design for syntax analysis. It reads input tokens and produces a parse tree according to the LR(1) parsing technique.

## Tech Stack

### Backend

- Python
- Flask API

### Frontend

- React
- Vite
- Tailwind CSS
- Typescript

## Getting Started

To get started with this project, clone the repository and navigate into the project directory.

```sh
git clone https://github.com/Mani-SSH/Canonical-LR-1-Parser.git
cd C-LR1-Parser
```

## Running the Application

### Frontend:

1. **Navigate to the frontend directory:**

   ```sh
   cd Frontend
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Start the frontend development server:**
   ```sh
   npm run dev
   ```

### Backend:

1. **Open a new terminal window and navigate to the backend directory:**

   ```sh
   cd Backend
   ```

2. **Create and activate a virtual environment (if not already done):**

   ```sh
   python -m venv .venv
   # For Windows:
   .venv\Scripts\activate
   # For macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install the required Python packages:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```sh
   python app\app.py
   ```

### Concurrently:

1. **For Windows:**
   ```sh
   cd Frontend
   npm start
   ```
2. **For Mac:**
   ```sh
   cd Frontend
   npm run start-all
   ```

## Environment Variables

To manage environment variables, create a `.env` file in both the frontend and backend directories. This ensures that environment-specific configurations are set properly.

## Contributing

- Fork the repository
- Create a new branch (`git checkout -b feature-branch`)
- Commit your changes (`git commit -am 'Add new feature'`)
- Push to the branch (`git push origin feature-branch`)
- Create a new Pull Request

## License

This project is licensed under the MIT License.
