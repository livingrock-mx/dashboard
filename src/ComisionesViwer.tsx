import React, { useState } from "react";
import * as XLSX from "xlsx";

type Cliente = {
  id: string;
  id_padre?: string;
  razon_social?: string;
  nombre?: string;
  comision?: any;
  isHeritaje?: boolean;
  heritajeFrom?: string;
};

export default function ComisionesViewer() {
  const [clientes, setClientes] = useState<Record<string, Cliente>>({});

  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json: any[] = XLSX.utils.sheet_to_json(sheet);
    console.log(json)
    const map: Record<string, Cliente> = {};

    const comissions: Record<string, any> = {};

    
    
    

    json.forEach((row) => {
        if (!row.nivel) {
        comissions[row.id] = {name: row.razon_social,comission: JSON.parse(row.comision)};
      }
      if (row.nivel == 1 && row.razon_social && row.comision) {
        comissions[row.id] = {name: row.razon_social,comission: JSON.parse(row.comision)};
      }
      const isHeritaje = row.comision ? false : true;
      let heritajeFrom = null;
      if (isHeritaje) {
        heritajeFrom = comissions[row.id_padre]?.name || comissions[row.id_cliente_contratante]?.name
      }

      const comision  = row.comision ? JSON.parse(row.comision) : comissions[row.id_padre]?.comission || comissions[row.id_cliente_contratante]?.comission
        map[row.id] = {
        id: row.id,
        id_padre: row.id_padre,
        razon_social: row.razon_social,
        nombre: row.nombre,
        comision: comision,
        isHeritaje,
        heritajeFrom
      };
    });

    setClientes(map);
  };

  const getComision = (cliente: Cliente): any => {
    let actual: Cliente | undefined = cliente;

    while (actual) {
      if (actual.comision) return actual.comision;

      if (!actual.id_padre) return null;

      actual = clientes[actual.id_padre];
    }

    return null;
  };

  const formatFee = (fee: any) => {
    if (fee.amount_type === 2) {
      return `${Number(fee.amount) * 100}%`;
    }

    return `$${fee.amount}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Comisiones por Cliente</h2>

      <input type="file" accept=".xlsx" onChange={handleFile} />

      <table border={1} cellPadding={6} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Transfer</th>
            <th>Outcoming</th>
            <th>Heredado</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(clientes).map((c) => {
            const comision = getComision(c);

            const tipo = c.razon_social
              ? "Persona Moral"
              : "Persona Física";

            return (
              <tr key={c.id}>
                <td>{c.id}</td>

                <td>
                  {c.razon_social || c.nombre}
                </td>

                <td>{tipo}</td>

                <td>
                  {comision?.transfer?.fee_detail?.map((f: any) => (
                    <div key={f.name}>
                      {f.name}: {formatFee(f)}
                    </div>
                  ))}
                </td>

                <td>
                  {comision?.outcoming?.fee_detail?.map((f: any) => (
                    <div key={f.name}>
                      {f.name}: {formatFee(f)}
                    </div>
                  ))}
                </td>
                <td>
                  {c.heritajeFrom}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}