"use client"
import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from '@/amplifyconfiguration.json';
Amplify.configure(config);

function App({ signOut, user }) {
  return (
    <>
      {
        user ? 
        <>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </>
        :
        ''
      }
      <button onClick={currentAuthenticatedUser}>currentAuthenticatedUser</button>
    </>
  );
}

// export default withAuthenticator(App);
export default App;

import { getCurrentUser } from 'aws-amplify/auth';

async function currentAuthenticatedUser() {
  try {
    const { username, userId, signInDetails } = await getCurrentUser();
    console.log(`The username: ${username}`);
    console.log(`The userId: ${userId}`);
    console.log(`The signInDetails: ${signInDetails}`);
  } catch (err) {
    console.log(err);
  }
}

async function signIn({ username, password }) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });

  } catch (error) {
    console.log('error signing in', error);
  }
}
