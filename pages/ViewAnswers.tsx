import React, { useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import NotebookPage from '../components/NotebookPage';
import { ChevronLeft, Download, FileText, Share2, Trash2 } from 'lucide-react';
import { UserSlamData, SlamAnswer } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ViewAnswersProps {
  user: User;
}

const ViewAnswers: React.FC<ViewAnswersProps> = ({ user }) => {
  const [slamData, setSlamData] = useState<UserSlamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setSlamData(docSnap.data() as UserSlamData);
        }
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [user.uid]);

  const downloadSinglePDF = async (answerId: string, friendName: string) => {
    const element = pageRefs.current[answerId];
    if (!element) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${friendName}_SlamBook_Page.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const downloadAllPDF = async () => {
    if (!slamData || slamData.answers.length === 0) return;
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < slamData.answers.length; i++) {
        const answer = slamData.answers[i];
        const element = pageRefs.current[answer.id];
        if (!element) continue;

        if (i > 0) pdf.addPage();
        
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Full_SlamBook_Memories.pdf`);
    } catch (err) {
      console.error("Full PDF generation failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-20 text-center handwritten text-2xl text-pink-500 animate-pulse">Opening your memories...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-2">
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-pink-600 handwritten">Sweet Memories</h1>
        </div>
        
        {slamData && slamData.answers.length > 0 && (
          <button 
            onClick={downloadAllPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full font-bold shadow-lg hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            <Download size={20} /> {exporting ? "Generating..." : "Download Full Book (PDF)"}
          </button>
        )}
      </div>

      <div className="space-y-16">
        {!slamData || slamData.answers.length === 0 ? (
          <NotebookPage title="Empty Notebook">
            <div className="text-center py-20 text-gray-400 italic handwritten text-2xl">
              No one has written in your slam book yet.<br/>
              Share your link to collect memories!
            </div>
          </NotebookPage>
        ) : (
          slamData.answers.map((answer, index) => (
            <div key={answer.id} className="relative group">
              <div 
                ref={el => { pageRefs.current[answer.id] = el; }}
                className="pdf-page-container"
              >
                <NotebookPage title={`Page ${index + 1}: ${answer.friendName}`}>
                  <div className="space-y-8 py-4">
                    <div className="flex justify-between items-center border-b border-pink-50 pb-2 mb-4">
                      <span className="text-sm text-gray-400 italic">Submitted on {new Date(answer.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {slamData.config.questions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-1">
                        <label className="block text-sm font-bold text-pink-300 uppercase tracking-tighter">{q}</label>
                        <p className="text-xl handwritten text-gray-800 border-b border-blue-50 pb-1">
                          {answer.answers[q] || <span className="text-gray-200 italic">No answer</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </NotebookPage>
              </div>
              
              <div className="absolute top-4 right-[-50px] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => downloadSinglePDF(answer.id, answer.friendName)}
                  title="Download this page"
                  className="p-3 bg-white text-pink-500 rounded-full shadow-lg hover:bg-pink-50 transition-all"
                >
                  <FileText size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAnswers;