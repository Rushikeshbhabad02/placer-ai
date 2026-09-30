import './table.css';

function Table({ data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            <td>{item.company}</td>
            <td>{item.role}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;