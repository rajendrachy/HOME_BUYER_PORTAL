/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      
      // Handle undefined or null values
      if (value === undefined || value === null) {
        value = '';
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value);
      const escapedValue = stringValue.replace(/"/g, '""');
      
      // Wrap in quotes if contains comma or newline
      if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
        return `"${escapedValue}"`;
      }
      return escapedValue;
    });
    csvRows.push(values.join(','));
  }
  
  // Create blob and download
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export applications to CSV
 * @param {Array} applications - List of applications
 * @param {string} filename - Custom filename
 */
export const exportApplicationsToCSV = (applications, filename = 'applications') => {
  const exportData = applications.map(app => ({
    'Application ID': app.applicationId,
    'Applicant Name': app.userId?.name || 'N/A',
    'Applicant Email': app.userId?.email || 'N/A',
    'Applicant Phone': app.userId?.phone || 'N/A',
    'Citizenship Number': app.personalInfo?.citizenshipNumber || 'N/A',
    'Property District': app.property?.district || 'N/A',
    'Property Municipality': app.property?.municipality || 'N/A',
    'Property Ward': app.property?.ward || 'N/A',
    'Property Type': app.property?.type || 'N/A',
    'Property Cost (NPR)': app.property?.cost || 0,
    'Subsidy Requested (NPR)': app.subsidyRequested || 0,
    'Subsidy Approved (NPR)': app.subsidyApproved || 0,
    'Status': app.status || 'N/A',
    'Submitted Date': new Date(app.submittedAt).toLocaleDateString(),
    'Approved Date': app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : 'N/A',
    'Officer Notes': app.officerNotes || 'N/A'
  }));
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  exportToCSV(exportData, `${filename}_${timestamp}`);
};
