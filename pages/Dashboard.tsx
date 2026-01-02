
import React, { useEffect, useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import NotebookPage from '../components/NotebookPage';
import { Book, Share2, Eye, PlusCircle, LogOut, Copy, CheckCircle } from 'lucide-react';
import { UserSlamData } from '../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [slamData, setSlamData] = useState<UserSlamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlamData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSlamData(docSnap.data() as UserSlamData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlamData();
  }, [user.uid]);

  const handleLogout = () => signOut(auth);

  // Generate a robust share link even in blob or sandboxed environments
  const getShareLink = () => {
    const base = window.location.origin && window.location.origin !== 'null' 
      ? window.location.origin 
      : window.location.href.split('#')[0];
    
    // Ensure we don't have double slashes if base ends with one
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}/#/fill/${user.uid}`;
  };

  const shareLink = getShareLink();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy:", err);
      alert("Could not copy link automatically. Please select and copy it manually.");
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="text-xl handwritten text-pink-400">Reading your notebook...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-600 handwritten">My Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {!slamData ? (
          <NotebookPage title="Ready to Start?">
            <div className="text-center py-12">
              <Book className="w-16 h-16 text-pink-200 mx-auto mb-6" />
              <p className="text-xl text-gray-600 mb-8 handwritten">
                You haven't created your slam book yet! Let's set it up with some fun questions.
              </p>
              <Link 
                to="/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold transition-all shadow-lg hover:-translate-y-1"
              >
                <PlusCircle size={20} /> Create My Slam Book
              </Link>
            </div>
          </NotebookPage>
        ) : (
          <div className="space-y-8">
            <NotebookPage title={slamData.config.title} color="bg-white">
              <div className="space-y-8 py-4">
                <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-100">
                  <h3 className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-2">
                    <Share2 size={18} /> Share with Friends
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm italic">
                    Copy this link and send it to your friends so they can fill your slam book!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      readOnly 
                      value={shareLink} 
                      className="flex-1 px-4 py-2 bg-white border border-pink-200 rounded-lg text-sm truncate"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="px-6 py-2 bg-pink-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-sm"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={`/answers/${user.uid}`}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    <Eye size={20} /> View Memories ({slamData.answers?.length || 0})
                  </Link>
                  <Link 
                    to="/create"
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-xl font-bold transition-all shadow-sm"
                  >
                    <PlusCircle size={20} /> Edit Questions
                  </Link>
                </div>

                <div className="pt-6 border-t border-pink-50">
                   <h4 className="font-bold text-gray-500 mb-3 handwritten">Slam Book Stats</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-pink-600">{slamData.config.questions.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest">Questions</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-purple-600">{slamData.answers?.length || 0}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest">Responses</div>
                      </div>
                   </div>
                </div>
              </div>
            </NotebookPage>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
