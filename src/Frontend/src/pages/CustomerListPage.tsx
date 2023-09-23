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
    TextField,
    Button,
  } from "@mui/material";
  import { useEffect, useState } from "react";
  import xmlbuilder from "xmlbuilder";
  
  import { tableCellClasses } from "@mui/material/TableCell"; // Import corretto di tableCellClasses
  
  interface CustomerListQuery {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    iban: string;
  }
  
  export default function CustomersListPage() {
    const [list, setList] = useState<CustomerListQuery[]>([]);
    const [filteredCustomer, setFilteredCustomer] = useState<CustomerListQuery[]>([]);
    const [searchCriteria, setSearchCriteria] = useState({
      Name: "",
      Email: "",
    });
    const [exporting, setExporting] = useState(false);
  
    useEffect(() => {
      fetch("/api/customer/list")
        .then((response) => response.json())
        .then((data) => {
          setList(data as CustomerListQuery[]);
          filterCustomer(data as CustomerListQuery[], searchCriteria);
        });
    }, [searchCriteria]);
  
    const generateXML = () => {
      const root = xmlbuilder.create("customers");
  
      list.forEach((customer) => {
        const customerXML = root.ele("customer");
        customerXML.ele("id", customer.id);
        customerXML.ele("name", customer.name);
        customerXML.ele("address", customer.address);
        customerXML.ele("email", customer.email);
        customerXML.ele("phone", customer.phone);
        customerXML.ele("iban", customer.iban);
      });
  
      return root.end({ pretty: true });
    };
  
    const handleExportClick = () => {
      const xmlData = generateXML();
      const blob = new Blob([xmlData], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xml";
      a.click();
      URL.revokeObjectURL(url);
    };
  
    const filterCustomer = (customers: CustomerListQuery[], criteria: { Name: string; Email: string }) => {
      const filtered = customers.filter((customer) => {
        const nameMatch = customer.name.toLowerCase().includes(criteria.Name.toLowerCase());
        const emailMatch = customer.email.toLowerCase().includes(criteria.Email.toLowerCase());
        return nameMatch && emailMatch;
      });
      setFilteredCustomer(filtered);
    };
  
    return (
      <>
        <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
          Customer List
        </Typography>
  
        <div style={{ marginBottom: "10px" }}>
          <TextField
            label="Name"
            value={searchCriteria.Name}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, Name: e.target.value })}
          />
          <TextField
            label="Email"
            value={searchCriteria.Email}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, Email: e.target.value })}
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
          <Table sx={{ minWidth: 650 }} aria-label="customer table">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell>Address</StyledTableHeadCell>
                <StyledTableHeadCell>Email</StyledTableHeadCell>
                <StyledTableHeadCell>Phone</StyledTableHeadCell>
                <StyledTableHeadCell>Iban</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomer.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.iban}</TableCell>
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
  