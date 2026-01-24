// Form Designer Page
import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]'; 
import { FormBuilderProvider } from '../../../services/form-designer/formBuilderContext';
import { FormDesigner } from '../../../components/form-designer/FormDesigner';
import { ErrorBoundary } from '../../../components/form-designer/ErrorBoundary';
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import styles from '../../../styles/form-designer/layout.module.css';

interface FormDesignerPageProps {
  formId: string;
}

const FormDesignerPage: React.FC<FormDesignerPageProps> = ({ formId }) => {
  const router = useRouter();
  console.log(`inside [id]-> ${formId}, router: ${router.isFallback}`);

  // Handle loading state
  if (router.isFallback) {
    console.log(`inside router.fallback: why?????`);
    return (
      <div className={styles.designerContainer}>
        <Navbar />
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading form designer...</p>
        </div>
      </div>
    );
  }

  // Handle missing form ID
  if (!formId) {
    return (
      <div className={styles.designerContainer}>
        <Navbar />
        <div className={styles.errorState}>
          <h2>Form not found</h2>
          <p>Please provide a valid form ID</p>
          <button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('crossed both checkpoints...trying to render the page.');
  return (
    <>
      <Navbar />
      <ErrorBoundary>
        <FormBuilderProvider formId={formId}>
          <FormDesigner formId={formId}/>
        </FormBuilderProvider>
      </ErrorBoundary>
      <Footer />
    </>
  );
};

// Server-side props to check authentication and get form ID
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Check if user is authenticated
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Get form ID from params
    const { id } = context.params as { id: string };
    
    if (!id) {
      return {
        notFound: true,
      };
    }

    // In production, you would verify that:
    // 1. The form exists
    // 2. The user has permission to edit it
    // For now, we'll just pass the ID
    
    return {
      props: {
        formId: id,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    };
  }
};

export default FormDesignerPage;