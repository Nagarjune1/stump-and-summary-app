
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PDFExport = ({ matchData, scoreData, currentBatsmen, currentBowler, innings1Score, currentInnings }) => {
  const generatePDF = async () => {
    try {
      // Create HTML content for PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cricket Match Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .players-section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cricket Match Report</h1>
            <h2>${matchData.team1?.name || 'Team 1'} vs ${matchData.team2?.name || 'Team 2'}</h2>
            <p><strong>Venue:</strong> ${matchData.venue}</p>
            <p><strong>Format:</strong> ${matchData.format}</p>
            <p><strong>Date:</strong> ${new Date(matchData.match_date).toLocaleDateString()}</p>
          </div>
          
          <div class="score-section">
            <h3>Match Summary</h3>
            ${innings1Score ? `
              <p><strong>Innings 1:</strong> ${innings1Score.runs}/${innings1Score.wickets} (${innings1Score.overs} overs)</p>
            ` : ''}
            ${currentInnings === 2 ? `
              <p><strong>Innings 2:</strong> ${scoreData.runs}/${scoreData.wickets} (${scoreData.overs}.${scoreData.balls} overs)</p>
            ` : `
              <p><strong>Current Score:</strong> ${scoreData.runs}/${scoreData.wickets} (${scoreData.overs}.${scoreData.balls} overs)</p>
            `}
          </div>
          
          ${currentBatsmen.length > 0 ? `
            <div class="players-section">
              <h3>Current Batsmen</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>Strike Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentBatsmen.map(batsman => `
                    <tr>
                      <td>${batsman.name}</td>
                      <td>${batsman.runs || 0}</td>
                      <td>${batsman.balls || 0}</td>
                      <td>${batsman.fours || 0}</td>
                      <td>${batsman.sixes || 0}</td>
                      <td>${(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${currentBowler ? `
            <div class="players-section">
              <h3>Current Bowler</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Overs</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Economy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${currentBowler.name}</td>
                    <td>${currentBowler.overs || 0}</td>
                    <td>${currentBowler.runs || 0}</td>
                    <td>${currentBowler.wickets || 0}</td>
                    <td>${(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="score-section">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast({
          title: "PDF Export",
          description: "Print dialog opened. Choose 'Save as PDF' in your browser's print dialog.",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to open print dialog. Please allow popups for this site.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      Export PDF
    </Button>
  );
};

export default PDFExport;
