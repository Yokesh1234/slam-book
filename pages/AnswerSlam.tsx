
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import NotebookPage from '../components/NotebookPage';
import { Send, Heart, CheckCircle } from 'lucide-react';
import { UserSlamData, SlamAnswer } from '../types';

const AnswerSlam: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [slamData, setSlamData] = useState<UserSlamData | null>(null);
  const [friendName, setFriendName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSlam = async () => {
      if (!userId) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
          setSlamData(docSnap.data() as UserSlamData);
        }
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlam();
  }, [userId]);

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !friendName) return;

    setSubmitting(true);
    try {
      const newAnswer: SlamAnswer = {
        id: Math.random().toString(36).substr(2, 9),
        friendName,
        answers,
        submittedAt: Date.now()
      };

      await updateDoc(doc(db, 'users', userId), {
        answers: arrayUnion(newAnswer)
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center handwritten text-2xl text-pink-500 animate-pulse">Loading the notebook...</div>;
  if (!slamData) return <div className="p-20 text-center handwritten text-2xl text-red-400">Oops! This slam book doesn't exist.</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
        <NotebookPage title="Thank You! ✨">
          <div className="text-center py-12 space-y-6">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
            <p className="text-2xl handwritten text-gray-700">
              Yay! Your answers have been saved in {slamData.config.creatorEmail}'s slam book!
            </p>
            <p className="text-pink-500 handwritten text-xl italic">
              Memories last forever! 💖
            </p>
            <div className="pt-8">
              <a 
                href="/"
                className="inline-block px-8 py-3 bg-pink-500 text-white rounded-full font-bold shadow-lg hover:bg-pink-600 transition-all"
              >
                Create My Own Slam Book
              </a>
            </div>
          </div>
        </NotebookPage>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      <NotebookPage title={slamData.config.title}>
        <form onSubmit={handleSubmit} className="space-y-10 pb-12">
          <div className="text-center italic text-pink-400 mb-8 handwritten text-xl">
            "Fill this page with love and memories"
          </div>

          <div className="border-b-2 border-pink-100 pb-4">
            <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">My Name</label>
            <input 
              required
              placeholder="What do I call you? :)"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full text-2xl handwritten text-pink-600 outline-none bg-transparent"
            />
          </div>

          <div className="space-y-12">
            {slamData.config.questions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-lg handwritten text-gray-500">{idx + 1}. {q}</label>
                <textarea 
                  rows={1}
                  placeholder="Type here..."
                  value={answers[q] || ""}
                  onChange={(e) => handleAnswerChange(q, e.target.value)}
                  className="w-full text-xl handwritten text-gray-800 border-b border-blue-200 focus:border-pink-400 outline-none bg-transparent resize-none py-1"
                  style={{ minHeight: '3rem' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
            ))}
          </div>

          <div className="pt-10">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold transition-all shadow-xl hover:-translate-y-1 disabled:opacity-50"
            >
              <Send size={20} /> {submitting ? "Sharing Memories..." : "Share My Memories"}
            </button>
          </div>
        </form>
      </NotebookPage>
    </div>
  );
};

export default AnswerSlam;
