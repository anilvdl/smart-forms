// API route for creating new forms
import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]'; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // // Get user session
    // const session = await getServerSession(req, res, authOptions);
    
    // if (!session || !session.user) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    const { title, type, status } = req.body;

    // Generate a new form ID
    const formId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`inside create.ts->formId: ${formId}`);
    // In production, you would:
    // 1. Create the form in your database
    // 2. Associate it with the user's organization
    // 3. Set initial form schema
    
    // For now, we'll just return the form ID
    // The form designer will handle the rest when it loads
    
    res.status(201).json({
      formId,
      title: title || 'Untitled Form',
      type: type || 'blank',
      status: status || 'draft',
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Failed to create form' });
  }
}