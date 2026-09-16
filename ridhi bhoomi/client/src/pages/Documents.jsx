import SEO from '../components/SEO';
import { documents } from '../data/project';
import { FileText, Download } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <>
      <SEO title="Project Documents" description="Download official Ridhi Bhoomi project documents — brochure, master plan, plot maps and price charts." path="/documents" />
      <div className="section-padding pb-24">
        <div className="container-main max-w-3xl">
          <h1 className="font-display text-4xl font-bold">Project Documents</h1>
          <p className="mt-2 text-brand-muted">Official project materials for your reference</p>
          <div className="mt-10 space-y-4">
            {documents.map((doc) => (
              <div key={doc.file} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-brand-green shrink-0" size={24} />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-xs text-brand-muted">{doc.category}</p>
                  </div>
                </div>
                <a
                  href={`/documents/${encodeURIComponent(doc.file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs shrink-0"
                >
                  <Download size={14} /> View
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-brand-muted">
            Banking details and sensitive information from booking documents are not displayed on this public page.
          </p>
        </div>
      </div>
    </>
  );
}
