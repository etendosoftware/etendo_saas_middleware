import { supabase } from '@/lib/supabase';

const remoteBaseUrl =
  process.env.NEXT_PUBLIC_ETENDO_URL ?? 'http://localhost:8080/etendo';
const loginUri = '/secureApp/LoginHandler.html';

/**
 * Logs into the remote Etendo system using the provided username
 * (for example "MyEnvUser").
 *
 * - Checks if there is an active Supabase session.
 * - Retrieves the access token from that session.
 * - Calls the remote API, and if successful, redirects the browser
 *   to the 'target' URL returned by the server.
 *
 * @param username - The remote username (e.g., "MyEnvUser").
 * @throws Error if there is no Supabase session, no token, or if the remote login fails.
 */
export async function etendoLogin(username: string): Promise<void> {
  // Retrieve the current Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No Supabase session found.');
  }

  const token = session.access_token;
  if (!token) {
    throw new Error('No access token found in Supabase session.');
  }

  // Build the form parameters required by the remote login endpoint
  const formParams = new URLSearchParams();
  formParams.append('access_token', token);
  formParams.append('user', username);

  // Make the request to the remote login endpoint
  const response = await fetch(`${remoteBaseUrl}${loginUri}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formParams.toString(),
  });

  if (!response.ok) {
    throw new Error('Remote login request returned an error.');
  }

  const data = await response.json();
  if (!data?.target) {
    throw new Error('Remote login did not return a valid "target" URL.');
  }

  // Redirect the browser to the target URL provided by Etendo
  window.location.href = data.target;
}