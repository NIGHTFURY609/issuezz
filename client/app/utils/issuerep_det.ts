const fetchDetails = async (repoUrl: string) => {



  if (!repoUrl.trim() || !repoUrl.startsWith("https://github.com/")) {
    alert("Please enter a valid GitHub URL.");
    return null;
  }

  const headers = {
    'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const parts = repoUrl.split('/');
    if (parts.length < 5 || !parts[3]?.trim() || !parts[4]?.trim()) {
      alert("Invalid GitHub URL. Please enter a valid repository or issue URL.");
      return null;
    }

    const owner = parts[3];
    const repo = parts[4];
    const issueNumber = parts[5] === 'issues' && parts[6] ? parts[6] : null;

    const fetchAllFiles = async (owner: string, repo: string, path: string = ''): Promise<any[]> => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents${path}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch the repository details. Status: ${response.status}`);
      }
      
      const items = await response.json();
      let files: { name: string; path: string; download_url: string }[] = [];

      for (const item of items) {
        if (item.type === 'file' && (/\.(js|py|java|cpp|html|json|xml|rb|go|php|ts|tsx|jsx|sh|yml|yaml)$/i).test(item.name)) {
          files.push({
            name: item.name,
            path: item.path,
            download_url: item.download_url,
          });
        } else if (item.type === 'dir') {
          try {
            const nestedFiles = await fetchAllFiles(owner, repo, `/${item.path}`);
            files = files.concat(nestedFiles);
          } catch (error) {
            console.warn(`Skipping directory ${item.path} due to error:`, error);
            continue;
          }
        }
      }
      return files;
    };

    const filteredFiles = await fetchAllFiles(owner, repo);

    // Fetch issue details with authentication
    let issueDetails = null;
    if (issueNumber) {
      const issueResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
        { headers }
      );
      if (!issueResponse.ok) {
        throw new Error("Could not fetch issue details.");
      }
      const issueData = await issueResponse.json();
      issueDetails = {
        owner,
        repo,
        title: issueData.title,
        description: issueData.body,
        labels: issueData.labels.map((label: { name: string }) => label.name),
      };
    }

    const res = {
      owner: owner,
      repo: repo,
      filteredFiles: filteredFiles, // Make sure this array is properly terminated
      issueDetails: issueDetails    // Last property should NOT have a trailing comma
    };
    
    console.log(res);

    try {
      const postResponse = await fetch('https://issuewiz.onrender.com/api/issues/match-keywords', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          filteredFiles: filteredFiles.map(file => ({
            name: file.name,
            path: file.path,
            download_url: file.download_url
          })),
          issueDetails: issueDetails ? {
            owner: issueDetails.owner,
            repo: issueDetails.repo,
            title: issueDetails.title,
            description: issueDetails.description,
            labels: issueDetails.labels
          } : null
        })
      });

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        throw new Error(`Failed to send data to the endpoint: ${errorText}`);
      }

      const responseData = await postResponse.json();
      console.log("Response Data:", responseData);
      return responseData; // Ensure this is returned from the function
    } catch (postError) {
      console.error("Error during fetch:", postError);
      throw postError;
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while fetching details.");
  }
};

export default fetchDetails;
