// import { defineConfig } from "drizzle-kit";
// import dbConnect from '@/lib/db';

// export default defineConfig({
//   dialect: "postgresql",
//   schema: "./util/schema.js",
//   dbCredentials:{
//     url:'postgresql://neondb_owner:npg_Akxt3dWmfns9@ep-steep-bonus-a5kp8k2u.us-east-2.aws.neon.tech/aiInterviewMocker?sslmode=require'
//   }
// });

// export async function ServerComponent() {
//     await dbConnect();
//     // Your database operations here
// }
import dbConnect from '@/lib/db';

export async function GET() {
    await dbConnect();
    // Your database operations here
}