# test_run.py
from model.matcher import IssueMatcher
import time
import asyncio
import json

# Sample test data


sampleinput={
  "owner": "Udayraj123",
  "repo": "OMRChecker",
  "filteredFiles": [
    {
      "name": "FUNDING.yml",
      "path": ".github/FUNDING.yml",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/.github/FUNDING.yml"
    },
    {
      "name": "pre-commit.yml",
      "path": ".github/pre-commit.yml",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/.github/pre-commit.yml"
    },
    {
      "name": ".pre-commit-config.yaml",
      "path": ".pre-commit-config.yaml",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/.pre-commit-config.yaml"
    },
    {
      "name": "main.py",
      "path": "main.py",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/main.py"
    },
    {
      "name": "evaluation.json",
      "path": "samples/answer-key/using-csv/evaluation.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/answer-key/using-csv/evaluation.json"
    },
    {
      "name": "template.json",
      "path": "samples/answer-key/using-csv/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/answer-key/using-csv/template.json"
    },
    {
      "name": "evaluation.json",
      "path": "samples/answer-key/weighted-answers/evaluation.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/answer-key/weighted-answers/evaluation.json"
    },
    {
      "name": "template.json",
      "path": "samples/answer-key/weighted-answers/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/answer-key/weighted-answers/template.json"
    },
    {
      "name": "template.json",
      "path": "samples/community/Antibodyy/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/Antibodyy/template.json"
    },
    {
      "name": "template.json",
      "path": "samples/community/Sandeep-1507/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/Sandeep-1507/template.json"
    },
    {
      "name": "template.json",
      "path": "samples/community/Shamanth/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/Shamanth/template.json"
    },
    {
      "name": "config.json",
      "path": "samples/community/UPSC-mock/config.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/UPSC-mock/config.json"
    },
    {
      "name": "evaluation.json",
      "path": "samples/community/UPSC-mock/evaluation.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/UPSC-mock/evaluation.json"
    },
    {
      "name": "template.json",
      "path": "samples/community/UPSC-mock/template.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/UPSC-mock/template.json"
    },
    {
      "name": "config.json",
      "path": "samples/community/UmarFarootAPS/config.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/UmarFarootAPS/config.json"
    },
    {
      "name": "evaluation.json",
      "path": "samples/community/UmarFarootAPS/evaluation.json",
      "download_url": "https://raw.githubusercontent.com/Udayraj123/OMRChecker/master/samples/community/UmarFarootAPS/evaluation.json"
    }
  ],
  "issueDetails": {
    "owner": "Udayraj123",
    "repo": "OMRChecker",
    "title": "[Environment] OpenCV NULL guiReceiver error during pre-commit testing.",
    "description": "*Describe the bug\nWhile running pre-commit hooks and pytest for my application, I'm encountering an OpenCV error related to GUI functions.\n\nTo Reproduce\nSteps to reproduce the behavior:\n1. Make any changes in code.\n2. Run commands git add and pre-commit run -a (make sure pre-commit is installed).\n3. Commit changes by running git commit -m \"commit message\"\n\nScreenshots\n![Screenshot from 2024-10-03 20-23-30](https://github.com/user-attachments/assets/f0ed906b-26f1-436c-ac39-93201f049153)\n\n**Desktop (please complete the following information):**\n - OS: Ubuntu 24.04.1 LTS\n - Python version - 3.12.3\n - OpenCV version - 4.10.0",
    "labels": [
      "bug",
      "good first issue",
      "hacktoberfest",
      "up-for-grabs",
      "Easy"
    ]
  }
}
issue_data=sampleinput['issueDetails']
filtered_files=sampleinput['filteredFiles']
async def main():
    # Initialize the matcher
    matcher = IssueMatcher()
    
    start_time=time.time()
    # Run the matching
    result = await matcher.match_files(issue_data, filtered_files)
    end_time=time.time()
    elapsed_time=end_time-start_time
    formatted_result = json.dumps(result, indent=4)
    print("Time taken :", elapsed_time)
    print(formatted_result)
    print(json.dumps(result,indent=4))
    

# Run the async function

if __name__ == "__main__":
    asyncio.run(main())