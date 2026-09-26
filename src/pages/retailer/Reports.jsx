import { useEffect, useState } from "react";
import { Download, Printer, X } from "lucide-react";

import Layout from "../../components/Layout";
import { getRetailerProfile, getRetailerReports } from "../../services/api";
import { showToast } from "../../utils/toast";

export default function RetailerReports() {
  const [profile, setProfile] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [mpesaRef, setMpesaRef] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        const [profileData, reportData] = await Promise.all([
          getRetailerProfile(),
          getRetailerReports(),
        ]);

        setProfile(profileData);
        setFarmers(reportData.farmers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, []);

  function buildReceiptMarkup() {
    if (!selectedFarmer) return "";

    const rows = selectedFarmer.records.length
      ? selectedFarmer.records
          .map(
            (record) => `
              <tr>
                <td>${record.collection_date}</td>
                <td>${Number(record.litres).toFixed(2)}</td>
                <td>KSh ${Number(record.price_per_litre || 0).toLocaleString()}</td>
                <td>KSh ${Number(record.total_amount || 0).toLocaleString()}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="4">No records available</td></tr>`;

    const receiptContent = `
      <html>
        <head>
          <title>Milk Collection Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 24px;
              color: #111827;
              background: #fff;
            }
            h1 { font-size: 28px; margin: 0 0 18px; }
            h3 { margin: 18px 0 8px; font-size: 18px; }
            p { margin: 6px 0; font-size: 15px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
            }
            th, td {
              border-bottom: 1px solid #e5e7eb;
              padding: 8px 6px;
              text-align: left;
              font-size: 14px;
            }
            .summary {
              margin-top: 14px;
              font-weight: bold;
            }
            .footer {
              margin-top: 14px;
              border-top: 1px solid #e5e7eb;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Milk Collection Receipt</h1>
          <p><strong>Company:</strong> ${profile?.business_name || "N/A"}</p>
          <p><strong>Retailer name:</strong> ${profile?.name || "N/A"}</p>
          <p><strong>Contact:</strong> ${profile?.phone || "N/A"}</p>

          <h3>Farmer details</h3>
          <p><strong>Farmer name:</strong> ${selectedFarmer.name}</p>
          <p><strong>Phone:</strong> ${selectedFarmer.phone || "N/A"}</p>
          <p><strong>Address:</strong> ${selectedFarmer.address || "N/A"}</p>

          <h3>Daily collection</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Milk (L)</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="summary">
            <p>Weekly litres: ${Number(selectedFarmer.weekLitres || 0).toFixed(2)} L</p>
            <p>Weekly amount: KSh ${Number(selectedFarmer.weekTotal || 0).toLocaleString()}</p>
            <p>Payment method: ${paymentMethod}</p>
            ${paymentMethod === "MPESA" ? `<p>M-Pesa ref: ${mpesaRef || "N/A"}</p>` : ""}
          </div>

          <div class="footer">
            <strong>Payment status:</strong> ${paymentMethod === "MPESA" ? `MPESA - ${mpesaRef || "No ref code"}` : "Cash"}
          </div>
        </body>
      </html>
    `;

    return receiptContent;
  }

  function handleReceiptPrint() {
    if (!selectedFarmer) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      showToast("Popup blocked. Please allow popups to print the receipt.", "error");
      return;
    }

    printWindow.document.write(buildReceiptMarkup());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  function handleReceiptDownload() {
    if (!selectedFarmer) return;

    const blob = new Blob([buildReceiptMarkup()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(selectedFarmer.name || "farmer").replace(/\s+/g, "-").toLowerCase()}-receipt.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Receipt downloaded", "success");
  }

  function openReceipt(farmer) {
    setSelectedFarmer(farmer);
    setPaymentMethod("CASH");
    setMpesaRef("");
  }

  function closeReceipt() {
    setSelectedFarmer(null);
  }

  function handlePrintReceipt() {
    document.body.classList.add("print-receipt-mode");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("print-receipt-mode");
    }, 500);
  }

  return (
    <Layout
      title="Reports"
      subtitle="Farmer collection reports and printable receipts."
    >
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Farmer collection reports</h2>
            <p>Click a farmer to generate a printable receipt for the week.</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="loading">Loading farmer reports...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Phone</th>
                  <th>Days recorded</th>
                  <th>Weekly litres</th>
                  <th>Weekly total</th>
                </tr>
              </thead>
              <tbody>
                {farmers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No farmer records found.
                    </td>
                  </tr>
                ) : (
                  farmers.map((farmer) => (
                    <tr key={farmer.id} onClick={() => openReceipt(farmer)} style={{ cursor: "pointer" }}>
                      <td>
                        <strong>{farmer.name}</strong>
                      </td>
                      <td>{farmer.phone || "—"}</td>
                      <td>{farmer.recordCount || 0}</td>
                      <td>{Number(farmer.weekLitres || 0).toFixed(2)} L</td>
                      <td>
                        <strong>KSh {Number(farmer.weekTotal || 0).toLocaleString()}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedFarmer && (
        <div className="receipt-overlay" onClick={closeReceipt}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <h3>Milk Collection Receipt</h3>
                <span>{profile?.business_name || "Retailer"}</span>
              </div>

              <button type="button" className="icon-button" onClick={closeReceipt} aria-label="Close receipt">
                <X size={18} />
              </button>
            </div>

            <div id="receipt-printable" className="receipt-body">
              <div className="receipt-section">
                <h4>Retailer details</h4>
                <p><strong>Company:</strong> {profile?.business_name || "N/A"}</p>
                <p><strong>Retailer name:</strong> {profile?.name || "N/A"}</p>
                <p><strong>Contact:</strong> {profile?.phone || "N/A"}</p>
              </div>

              <div className="receipt-section">
                <h4>Farmer details</h4>
                <p><strong>Farmer name:</strong> {selectedFarmer.name}</p>
                <p><strong>Phone:</strong> {selectedFarmer.phone || "N/A"}</p>
                <p><strong>Address:</strong> {selectedFarmer.address || "N/A"}</p>
              </div>

              <div className="receipt-section">
                <h4>Daily collection</h4>
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Milk (L)</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFarmer.records.length === 0 ? (
                      <tr>
                        <td colSpan="4">No records available</td>
                      </tr>
                    ) : (
                      selectedFarmer.records.map((record) => (
                        <tr key={record.id}>
                          <td>{record.collection_date}</td>
                          <td>{Number(record.litres).toFixed(2)}</td>
                          <td>KSh {Number(record.price_per_litre).toLocaleString()}</td>
                          <td>KSh {Number(record.total_amount).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="receipt-summary">
                <div>
                  <strong>Weekly litres:</strong> {Number(selectedFarmer.weekLitres || 0).toFixed(2)} L
                </div>
                <div>
                  <strong>Weekly amount:</strong> KSh {Number(selectedFarmer.weekTotal || 0).toLocaleString()}
                </div>
              </div>

              <div className="receipt-section">
                <label>Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                </select>

                {paymentMethod === "MPESA" && (
                  <div style={{ marginTop: 12 }}>
                    <label>M-Pesa reference</label>
                    <input
                      value={mpesaRef}
                      onChange={(e) => setMpesaRef(e.target.value)}
                      placeholder="e.g. MPESA-123456"
                    />
                  </div>
                )}
              </div>

              <div className="receipt-footer">
                <strong>Payment status:</strong> {paymentMethod === "MPESA" ? `MPESA - ${mpesaRef || "No ref code"}` : "Cash"}
              </div>
            </div>

            <div className="receipt-actions">
              <button type="button" className="secondary-button" onClick={handleReceiptPrint}>
                <Printer size={18} />
                Print
              </button>
              <button type="button" className="primary-button" onClick={handleReceiptDownload}>
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
