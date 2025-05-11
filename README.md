# issuezz
### Project Description
Issuezz is an AI-powered platform designed to lower the barrier to entry for open-source contributions by providing intelligent issue analysis, personalized recommendations, and contextual documentation. The system helps both newcomers and experienced developers navigate complex codebases and find suitable issues to work on.


### The Problem statement
Contributing to open-source projects can be challenging, especially for beginners, due to complex codebases, unclear documentation, and difficulty identifying relevant files. Even experienced developers struggle with narrowing down bugs and locating error files in large repositories. Without proper guidance, both beginners and experts end up spending more time searching than solving, making contributions inefficient.

### The Solution
Issuezz simplifies this process by providing the following:

- **Issue Analysis Engine** : Analyzes issues, identifies relevant files, and generates contextual documentation with interactive guidance.
- **Skill-Based Issue Matcher** : Matches users' skills with suitable issues, providing ranked recommendations for both learning and contribution.
- **Interactive Learning Assistant** : Offers real-time, AI-driven assistance for understanding code, troubleshooting, and improving development practices.
By lowering these barriers, IssueWiz makes open-source contributions more accessible and engaging for developers of all levels.


## Technical Details
### Technologies/Components Used
For Software:
- **Languages used**: Python, TypeScript
- **Frameworks used**: FastAPI, Next.js
- **Libraries used**: GitHub API, OpenAI API, SentenceTransformer,ThreadPoolExecuter, aiohttp, numpy
- **Tools used**: Render, Vercel

For Hardware:
- No hardware used in this project.

### Implementation
For Software:

#### Backend (server)  
##### Installation  
```bash
# Clone the repository
git clone https://github.com/yourusername/issuewiz.git
cd issuewiz/server

# Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements-server.txt -r model/requirements-model.txt

# Set up environment variables (GitHub API, OpenAI API, etc.)
# Create a `.env` file and add necessary keys

# Start the backend server
uvicorn app.main:app --reload
```  

##### Run  
```bash
# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows

# Run the backend server
uvicorn app.main:app --reload
```  

#### Frontend (client)  
##### Installation  
```bash
# Navigate to the frontend directory
cd ../client

# Install dependencies
npm install

# Set up environment variables if required
# Create a `.env` file and add necessary keys

# Start the frontend server
npm run dev
```  

##### Run  
```bash
npm run dev
```
### Project Documentation
For Software:

# Screenshots 
![image](https://github.com/user-attachments/assets/5cd41a5e-2a13-43f2-8a3f-f3183475561f)
*issuezz Landing Page*

![image](https://github.com/user-attachments/assets/9a22aa07-a260-46ef-a091-e29d4f0a006b)
*issuezz features*

![image](https://github.com/user-attachments/assets/7586f338-5bbf-4fc8-b916-b16d2bdf979e)
*Repository analysis*

![image](https://github.com/user-attachments/assets/25c5e572-b148-4f46-a49d-e42c6dab1a2e)
*Issue matcher*

![image](https://github.com/user-attachments/assets/295f3dfe-59d6-465a-9009-c6a0e8ae6907)
*issue recommendation page*


### Project Demo
# Video
[Youtube](https://www.youtube.com/watch?v=LsXWV6i_PTY)

