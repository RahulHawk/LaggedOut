// import User from '@/model/userModel';
// import Role from '@/model/roleModel';
// import dbConnect from '@/lib/dbConnect'; // Assuming you have a db connection utility

// export default async function handler(req, res) {
//     if (req.method !== 'GET') {
//         return res.status(405).json({ message: 'Method Not Allowed' });
//     }

//     await dbConnect();
//     const { id } = req.query;

//     try {
//         const user = await User.findById(id).populate('role', 'name');
//         if (!user) {
//             return res.status(200).json({ role: 'not_found' });
//         }
//         res.status(200).json({ role: user.role.name });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// }