// pages/Unauthorized.jsx
import Layout from "../components/Layout";

export default function Unauthorized() {
  return (
     <Layout>
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold mb-4">403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </div>
     </Layout>
  );
}
