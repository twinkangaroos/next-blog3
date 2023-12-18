// import { cookies } from 'next/headers';
// import { getCurrentUser } from '@aws-amplify/auth/server';
// import { runWithAmplifyServerContext } from '../../_utils/amplifyServerUtils';

// // This page always dynamically renders per request
// export const dynamic = 'force-dynamic';

// export default async function AuthGetCurrentUserServer() {
//     try {
//         const currentUser = await runWithAmplifyServerContext({
//             nextServerContext: { cookies },
//             operation: (contextSpec) => getCurrentUser(contextSpec)
//         });

//         return (
//             <AuthFetchResult
//                 description="The API is called on the server side."
//                 data={currentUser}
//             />
//         );
//     } catch (error) {
//         console.error(error);
//         return <p>Something went wrong...</p>;
//     }
// }
import { getCurrentUser } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '../../_utils/amplifyServerUtils';

export async function GET() {
    const user = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => getCurrentUser(contextSpec)
    });

    return NextResponse.json({ user });
}
export async function POST() {
    const user = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: (contextSpec) => getCurrentUser(contextSpec)
    });

    return NextResponse.json({ user });
}
