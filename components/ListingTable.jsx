"use client";
import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from '@mui/material/TableHead';
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ReactPaginate from "react-paginate";
export default function ListingTable({ data }) {
  const [PerItem, setPerItem] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  //   Start for Pagination
  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage);
  };

  function truncateEmail(email) {
    const atIndex = email.indexOf("@");
    if (atIndex !== -1) {
      return email.substring(0, atIndex + 1); // Include the "@" symbol
    }
    return email; // Return the original email if "@" is not found
  }

  const offset = currentPage * Number(PerItem);
  const currentItem = data?.slice(offset, offset + Number(PerItem)) || [];
  const pageCount = Math.ceil(data?.length / Number(PerItem));
  //End of Pagination
  console.log(data);
  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            <TableCell style={{fontWeight:700}}>Fullname</TableCell>
            <TableCell align="right" style={{ width: 50,fontWeight:700 }}>Gender</TableCell>
            <TableCell align="right" style={{ width: 100,fontWeight:700 }}>Location</TableCell>
            <TableCell align="left" style={{fontWeight:700}}>Bed</TableCell>
            <TableCell align="right" style={{fontWeight:700}}>Type</TableCell>
            <TableCell align="left" style={{fontWeight:700}}>Request</TableCell>
            <TableCell align="right" style={{fontWeight:700}}>Budget</TableCell>
            <TableCell align="left" style={{fontWeight:700}}>Status</TableCell>
            <TableCell align="right" style={{fontWeight:700}}>Action</TableCell>
          </TableRow>
        </TableHead>
          <TableBody>
            {currentItem?.map((row) => (
              <TableRow key={row._id}>
                <TableCell component="th" scope="row">
                  {row.fullname}
                </TableCell>
                <TableCell style={{ width: 50}} align="left">
                  {row.sex}
                </TableCell>
                <TableCell style={{ width: 100}} align="left">
                  {row.intendinglocation}
                </TableCell>
                <TableCell style={{ width: 90}} align="left">
                {row.bed}
                </TableCell>
                <TableCell style={{ width: 100 }} align="right">
                {row.type}
                </TableCell>
                <TableCell style={{ width: 320 }} align="justify">
                {row.request}
                </TableCell>
                <TableCell style={{ width: 130}} align="right">
                ₦ {row.budget.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                
                </TableCell>
                <TableCell style={{ width: 100}} align="left">
                {"open"}
                </TableCell>
                
                <TableCell style={{ width: 100 }} align="right">
                  <button className="p-2 border-1 rounded-md text-sm bg-red-400 text-white">View</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter></TableFooter> */}
        </Table>
      </TableContainer>
      <div className="flex flex-col md:flex-row p-2">
        <div className="md:w-6/12 lg:w-6/12 md:mb-0 mb-8">
          <div className="md:flex w-60 md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-10 md:mt-0">
            <label
              htmlFor="select"
              className="block text-sm font-medium text-gray-700"
            >
              Showing
            </label>
            <select
              value={PerItem}
              onChange={(e) => setPerItem(e.target.value)}
              id="select"
              aria-label="form-select-sm"
              className="block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300 sm:text-sm"
            >
              <option disabled value="">
                --Select--
              </option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-500 flex w-80">
              of {data?.data?.length} entries
            </span>
          </div>
        </div>
        <div className="md:w-7/12 lg:w-7/12 md:justify-end">
          <div className="mt-8 md:mt-0">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              pageRangeDisplayed={1}
              containerClassName={"flex items-center space-x-2"}
              previousLinkClassName={"text-gray-600"}
              nextLinkClassName={"text-gray-600"}
              disabledClassName={"text-gray-400"}
              activeClassName={
                "text-gray-400 font-bold w-7 h-7 border-2 flex items-center justify-center rounded-lg space-x-2"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
