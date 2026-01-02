
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import NotebookPage from '../components/NotebookPage';
import { Save, ChevronLeft, Plus, X, ListChecks } from 'lucide-react';
import { SlamBookConfig, UserSlamData } from '../types';

const DEFAULT_QUESTIONS = [
  "Full Name",
  "Your Nickname",
  "Date of Birth",
  "Zodiac Sign",
  "Favorite Color",
  "Hobby",
  "Best Memory with Me",
  "First Impression of Me",
  "One word to describe me",
  "My biggest strength",
  "My funniest habit",
  "Your message for me",
  "Favorite song right now"
];

interface CreateSlamProps {
  user: User;
}

const CreateSlam: React.FC<CreateSlamProps> = ({ user }) => {
  const [title, setTitle] = useState("My Sweet Memories");
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExisting = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as UserSlamData;
        setTitle(data.config.title);
        setQuestions(data.config.questions);
      }
    };
    fetchExisting();
  }, [user.uid]);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const toggleDefaultQuestion = (q: string) => {
    if (questions.includes(q)) {
      setQuestions(questions.filter(item => item !== q));
    } else {
      setQuestions([...questions, q]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const existingData = docSnap.exists() ? docSnap.data() : { answers: [] };

      const config: SlamBookConfig = {
        id: user.uid,
        creatorEmail: user.email!,
        title,
        themeColor: 'pink',
        questions,
        createdAt: Date.now()
      };

      await setDoc(userRef, {
        ...existingData,
        config
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save slam book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <button 
          onClick={handleSave} 
          disabled={loading || questions.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-full font-bold shadow-md hover:bg-pink-600 transition-all disabled:opacity-50"
        >
          <Save size={18} /> {loading ? "Saving..." : "Save My Slam Book"}
        </button>
      </div>

      <NotebookPage title="Slam Book Settings">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Notebook Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl handwritten-bold text-pink-600 border-b-2 border-pink-100 focus:border-pink-500 outline-none pb-2 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2">
              <ListChecks size={18} /> Choose Questions ({questions.length})
            </label>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {DEFAULT_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => toggleDefaultQuestion(q)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    questions.includes(q) 
                    ? 'bg-pink-100 border-pink-400 text-pink-700 font-medium' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-pink-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between group bg-white p-3 rounded-lg border border-pink-50 shadow-sm hover:border-pink-200 transition-all">
                  <span className="text-lg handwritten text-gray-700">{idx + 1}. {q}</span>
                  <button onClick={() => removeQuestion(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <input 
                placeholder="Add a custom question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                className="flex-1 px-4 py-3 bg-white border border-pink-200 rounded-xl outline-none focus:border-pink-500 handwritten text-lg shadow-inner"
              />
              <button 
                onClick={handleAddQuestion}
                className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all shadow-md"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </NotebookPage>
    </div>
  );
};

export default CreateSlam;
