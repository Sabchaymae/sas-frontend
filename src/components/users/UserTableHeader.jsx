const UserTableHeader = () => {
  const headers = [
    { label: 'Photo', className: 'px-2 py-4 w-12' },
    { label: 'Nom & Prénom', className: 'px-2 py-4 w-40' },
    { label: 'Identifiant', className: 'px-2 py-4 w-20' },
    { label: 'Email', className: 'px-2 py-4 w-48' },
    { label: 'Tél.', className: 'px-2 py-4 w-28' },
    { label: 'CIN / ID', className: 'px-2 py-4 w-24' },
    { label: 'Adresse', className: 'px-2 py-4 w-40' },
    { label: 'Rôle', className: 'px-2 py-4 w-28' },
    { label: 'Date N.', className: 'px-2 py-4 w-24' },
    { label: 'Création', className: 'px-2 py-4 w-24' },
    { label: 'Statut', className: 'px-2 py-4 w-24' },
    { label: 'Actions', className: 'px-2 py-4 text-right w-24' },
  ];

  return (
    <thead className="bg-[#F9FAFB] border-b border-gray-100">
      <tr>
        {headers.map((header) => (
          <th 
            key={header.label} 
            className={`${header.className} text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.05em] whitespace-nowrap`}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default UserTableHeader;
