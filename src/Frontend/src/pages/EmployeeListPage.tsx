import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  TextField, // Aggiungi l'import per il campo di input
} from "@mui/material";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import xmlbuilder from "xmlbuilder";

interface EmployeesListQuery {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
}

export default function EmployeesListPage() {
  const [list, setList] = useState<EmployeesListQuery[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeesListQuery[]>([]); // Stato per i dipendenti filtrati
  const [searchCriteria, setSearchCriteria] = useState({
    firstName: "",
    lastName: "",
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Carica l'elenco dei dipendenti all'avvio
    fetch("/api/employees/list")
      .then((response) => response.json())
      .then((data) => {
        setList(data as EmployeesListQuery[]);
        // Esegui il filtro iniziale
        filterEmployees(data as EmployeesListQuery[], searchCriteria);
      });
  }, [searchCriteria]);

  // Funzione per generare un documento XML dai dati della tabella
  const generateXML = () => {
    const root = xmlbuilder.create("employees");

    list.forEach((employee) => {
      const employeeXML = root.ele("employee");
      employeeXML.ele("id", employee.id);
      employeeXML.ele("code", employee.code);
      employeeXML.ele("firstName", employee.firstName);
      employeeXML.ele("lastName", employee.lastName);
      employeeXML.ele("address", employee.address);
      employeeXML.ele("email", employee.email);
      employeeXML.ele("phone", employee.phone);
    });

    return root.end({ pretty: true });
  };

  // Funzione per gestire il clic del pulsante di esportazione
  const handleExportClick = () => {
    const xmlData = generateXML();
    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funzione per eseguire il filtro dei dipendenti in base ai criteri di ricerca
  const filterEmployees = (employees: EmployeesListQuery[], criteria: { firstName: string; lastName: string }) => {
    const filtered = employees.filter((employee) => {
      const firstNameMatch = employee.firstName.toLowerCase().includes(criteria.firstName.toLowerCase());
      const lastNameMatch = employee.lastName.toLowerCase().includes(criteria.lastName.toLowerCase());
      return firstNameMatch && lastNameMatch;
    });
    setFilteredEmployees(filtered);
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Employees
      </Typography>

      {/* Campi di input per i criteri di ricerca */}
      <div style={{ marginBottom: "10px" }}>
        <TextField
          label="First Name"
          value={searchCriteria.firstName}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, firstName: e.target.value })}
        />
        <TextField
          label="Last Name"
          value={searchCriteria.lastName}
          onChange={(e) => setSearchCriteria({ ...searchCriteria, lastName: e.target.value })}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportClick}
          disabled={exporting}
          style={{ marginBottom: "10px" }}
        >
          Export as XML
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Code</StyledTableHeadCell>
              <StyledTableHeadCell>FirstName</StyledTableHeadCell>
              <StyledTableHeadCell>LastName</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((row) => (
              <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));
