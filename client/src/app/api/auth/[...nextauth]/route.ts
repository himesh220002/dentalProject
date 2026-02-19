import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    // Sync user with backend
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                    await axios.post(`${backendUrl}/api/auth/sync`, {
                        googleId: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image
                    });
                    return true;
                } catch (error) {
                    console.error('Error during sign in sync:', error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.sub;

                // Fetch extra info from backend if needed
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                    const res = await axios.get(`${backendUrl}/api/auth/google/${token.sub}`);
                    // @ts-ignore
                    session.user.patientId = res.data.patientId?._id;
                    // @ts-ignore
                    session.user.role = res.data.role;
                    // @ts-ignore
                    session.user.hasUpcomingAppointment = res.data.hasUpcomingAppointment;
                } catch (error) {
                    console.error('Error fetching user extra info:', error);
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
});

export { handler as GET, handler as POST };
