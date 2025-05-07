export interface UserProfile {
  name: string;
  bio: string;
  public_repos: number;
  hireable: boolean;
}

export interface Repository {
  name: string;
  description: string;
  language: string;
  topics: string[];
  forks_count: number;
  stargazers_count: number;
 primary_language: string;
}

export interface Issue {
  title: string;
  body: string;
  state: string;
  labels: { name: string }[];
  html_url: string;
  created_at: string;
  number:number;
}

export interface FetchedData {
  profile: UserProfile;
  repositories: Repository[];
  repoissues: Issue[];
  issue_owner:string;
  issue_repo:string;
}
const fetchDetails = async (username: string, repoUrl: string): Promise<FetchedData | null | undefined> => {
  if (!username.trim()) {
    alert('Please enter a valid GitHub username.');
    return null;
  }
  if (!repoUrl.trim()) {
    alert('Please enter a valid repository URL.');
    return null;
  }

  try {
    // Fetch user details
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user details. Please check the username.');
    }
    const userDetails = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories for the user.');
    }
    const repoDetails = await reposResponse.json();

    // Filter repositories for relevant details
    const filteredRepos = repoDetails.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      topics: repo.topics || [],
      forks_count: repo.forks_count || 0,
      stargazers_count: repo.stargazers_count || 0,
      primary_langague:repo.primary_langague || null,
    }));

    // Extract owner and repo name from the provided repository URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match || match.length < 3) {
      throw new Error('Invalid repository URL. Please ensure it follows the GitHub format.');
    }
    const issue_owner = match[1];
    const issue_repo = match[2];

    // Fetch repository issues
    const issuesResponse = await fetch(`https://api.github.com/repos/${issue_owner}/${issue_repo}/issues`);
    if (!issuesResponse.ok) {
      console.error('Failed to fetch issues for the repository.');
    }
    const issues = await issuesResponse.json();
    
    // Update repoIssues state with fetched issues
    const repoIssues=(
      issues.map((issue: any) => ({
        title: issue.title,
        body:issue.body,
        state: issue.state,
        labels: issue.labels.map((label: any) => label.name),
        created_at: issue.created_at,
        number: issue.number,
      }))
    );

    // Set the fetched data to state
    const res = ({
      profile: {
        name: userDetails.name,
        bio: userDetails.bio,
        public_repos: userDetails.public_repos,
        hireable: userDetails.hireable,
      },
      repositories: filteredRepos,
      repoissues: repoIssues,
      issue_owner: issue_owner, 
      issue_repo: issue_repo,
    });
    
    console.log(res);
    return res; 
  }
  catch (err) 
  {
    console.error(err);
  }
};

export default fetchDetails;
