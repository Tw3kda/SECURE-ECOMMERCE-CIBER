import React from "react";

export default function PaymentsModal({ payments, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4">Transferencias</h2>
        {payments.length === 0 ? (
          <p>No hay transferencias disponibles.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {payments.map((p) => (
              <div
                key={p.transactionId}
                className="border p-3 rounded shadow-sm flex justify-between"
              >
                <div>
                  <p>
                    <strong>ID:</strong> {p.transactionId}
                  </p>
                  <p>
                    <strong>Cliente:</strong>{" "}
                    {p.clientUsername || p.clientEmail}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${p.amount}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
