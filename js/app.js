var tableEdit = (function () {
    'use strict';

    return {
        _init: function () {
            this._defineNodes();


            this.options = {};
            this.options.itemsPerPage = 5;

            this.productTableDataArr = [];
            this.productTableDataObj = {};


            this._bind();
            this._fillByDemoData();
            this._sortTable(); 

        },

        _defineNodes: function () {
            this.nodes = {};
            this.nodes.productTableBody = document.getElementById('products-list');
            this.nodes.productTableBody = document.getElementById('products-list');
            this.nodes.productTitle = document.getElementById('pTitle');
            this.nodes.productQty = document.getElementById('pQty');
            this.nodes.productAvailability = document.getElementById('pAvailability');
            this.nodes.importDataForm = document.getElementById('import-data-form');
            this.nodes.importData = document.getElementById('data');
            this.nodes.filterField = document.getElementById('filter');
            this.nodes.productAddForm = document.getElementById('add-product-form');
            this.nodes.addRowBtn = document.getElementsByClassName('js-add-to-cart')[0];
            this.nodes.demoBtn = document.getElementsByClassName('js-demo-data')[0];
            this.nodes.deleteRowBtn = document.getElementsByClassName('js-delete-row')[0];
            this.nodes.clearTable = document.getElementsByClassName('js-clear-table')[0];
            this.nodes.exportBtn = document.getElementsByClassName('js-export-table')[0];
            this.nodes.pagination = document.getElementsByClassName('js-pagination')[0];
            this.nodes.tableTiles = document.getElementsByClassName('js-sort');
        },

        _bind: function () {
            let self = this;

            this.nodes.addRowBtn.onclick = function () {
                self._addRow();
            };

            this.nodes.demoBtn.onclick = function () {
                self._fillByDemoData();
            };

            this.nodes.productAddForm.onsubmit = function (e) {
                e.preventDefault();

                let productTitle = self.nodes.productTitle.value;

                if (productTitle.length > 3) {
                    self._addRow(productTitle, self.nodes.productQty.value);
                    this.reset();
                } else {
                    alert('- title can\'t be empty field, min length 3 symbols');
                }
            };

            this.nodes.deleteRowBtn.onclick = function () {
                self._deleteRow();
            };

            this.nodes.clearTable.onclick = function () {
                self._clearTable();
                self.nodes.pagination.innerHTML = '';
                self.productTableDataArr.length = 0;
            };

            this.nodes.exportBtn.onclick = function () {
                self.nodes.importData.value = self._exportData();
            };

            this.nodes.importDataForm.onsubmit = function (e) {
                e.preventDefault();
                self._importDataToTable();
            };

            this.nodes.filterField.onkeyup = function () {
                self._filterTable();
            };
        },

        _clearTable: function () {
            this.nodes.productTableBody.innerHTML = '<tbody id="products-list"></tbody>';
        },

        _deleteRow: function () {
            let productTable = this.nodes.productTableBody.children,
                deletedRowsCount = 0,
                isCheckBoxChecked;

            for (let i = 0; i < productTable.length; i++) {
                isCheckBoxChecked = productTable[i].getElementsByTagName('input')[0].checked;

                if (isCheckBoxChecked) {
                    delete this.productTableDataArr[i];
                    deletedRowsCount++;
                }
            }
            if (deletedRowsCount > 0) {
                let newTable = this.productTableDataArr.filter(function(id) {
                    if (id) {
                        return id;
                    }
                });

                this.productTableDataArr = newTable;
                this._paginateTable();
            }
        },

        _fillHTMLTable: function (startPos, endPos, dataArray) {
            let newTable = document.createDocumentFragment(),
                startP = (startPos) ? startPos : 0,
                end = (endPos) ? endPos : this.productTableDataArr.length;

            for (let i = startP; i < end; i++) {
                let tr = document.createElement('tr');

                if (dataArray) {
                    tr.innerHTML = '<tr>' +
                        '<td>' + (dataArray[i][0] + 1) + '</td>' +
                        '<td>' + dataArray[i][1] + '</td>' +
                        '<td>' + dataArray[i][2] + '</td>' +
                        '<td>'+ dataArray[i][3] + '</td>' +
                        '<td><input type="checkbox"/></td>' +
                        '</tr>';

                } else {
                    tr.innerHTML = '<tr>' +
                        '<td>' + (this.productTableDataArr[i][0] + 1)  + '</td>' +
                        '<td>' + this.productTableDataArr[i][1] + '</td>' +
                        '<td>' + this.productTableDataArr[i][2] + '</td>' +
                        '<td>'+ this.productTableDataArr[i][3] + '</td>' +
                        '<td><input type="checkbox"/></td>' +
                        '</tr>';
                }

                newTable.appendChild(tr);
            }

            this._clearTable();
            this.nodes.productTableBody.appendChild(newTable);
        },

        _fillByDemoData: function () {
            let randRowsCount = this._getRandomInt(4, 5);

            this.productTableDataArr = [];

            for (let i = 0; i < randRowsCount; i++) {

                let productName = this._generateName(),
                    productQty = this._getRandomInt(0, 1000),
                    availabilityVal = (Math.random() >= 0.5) ? 'yes' : 'no';

                this.productTableDataArr[i] = [];
                this.productTableDataArr[i][0] = i;
                this.productTableDataArr[i][1] = productName;
                this.productTableDataArr[i][2] = productQty;
                this.productTableDataArr[i][3] = availabilityVal;
            }

            this._paginateTable();
        },

        _exportData: function () {
            let tableItems = this.productTableDataArr.length;
            this.productTableDataObj = {};

            for (let i = 0; i < tableItems; i++) {
                this.productTableDataObj['' + i] = [];

                for (let j = 0; j < 4; j++) {
                    this.productTableDataObj['' + i][j] = this.productTableDataArr[i][j];
                }
            }

            return JSON.stringify(this.productTableDataObj);
        },

        _importDataToTable: function () {
            try {
                this.productTableDataObj = JSON.parse(this.nodes.importData.value);
            } catch (err) {
                alert('wrong JSON!');
                return;
            }

            let rowID = this.productTableDataArr.length;

            for (let key in this.productTableDataObj) {
                let i = +key + rowID;

                this.productTableDataArr[i] = [];
                this.productTableDataArr[i][0] = 1;
                this.productTableDataArr[i][1] = this.productTableDataObj[key][0];
                this.productTableDataArr[i][2] = this.productTableDataObj[key][1];
                this.productTableDataArr[i][3] = this.productTableDataObj[key][2];
            }
            this._paginateTable();
        },

        _addRow: function (pName, pQty, pAvailability) {
            let rowID,
                availabilityVal = (pAvailability) ? pAvailability : (Math.random() >= 0.5) ? 'yes' : 'no',
                productTitle = (pName) ? pName : this._generateName(),
                productQty = (pQty) ? pQty : this._getRandomInt(0, 1000);

            rowID = this.productTableDataArr.length;
            this.productTableDataArr[rowID] = [];
            this.productTableDataArr[rowID][0] = rowID;
            this.productTableDataArr[rowID][1] = productTitle;
            this.productTableDataArr[rowID][2] = productQty;
            this.productTableDataArr[rowID][3] = availabilityVal;
            this._paginateTable(rowID);
        },

        _generateName: function () {
            let generatedName = '',
                possibleSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                possibleSymbolsLength = possibleSymbols.length,
                generatedNamelength = this._getRandomInt(3, 10);

            for (let i = 0; i < generatedNamelength; i++) {
                generatedName += possibleSymbols.charAt(this._getRandomInt(0, possibleSymbolsLength));
            }

            return generatedName;
        },

        _getRandomInt: function (min, max) {
            return Math.round(min - 0.5 + Math.random() * (max - min + 1));
        },

        _filterTable: function () {
            let filterValue = this.nodes.filterField.value.toUpperCase();

            if (filterValue.length > 0) {
                let filteredTable = this.productTableDataArr.filter(function(item) {
                    return item[1].toUpperCase().indexOf(filterValue) > -1;
                });

                this.nodes.pagination.innerHTML = '';
                this._fillHTMLTable(0, filteredTable.length, filteredTable);
            } else {
                this._paginateTable();
            }
        },

        _paginateTable: function (lastPos) {
            let itemCount = this.productTableDataArr.length,
                rowsOnPage = Math.min(5, itemCount);

            this.nodes.pagination.innerHTML = '';
            if (itemCount > rowsOnPage) {
                let pagesCount = Math.ceil(itemCount / rowsOnPage),
                    paginationButtons = document.createDocumentFragment(),
                    endPos = (lastPos) ? itemCount : rowsOnPage,
                    startPos = (lastPos) ? ((Math.ceil(endPos / rowsOnPage) - 1) * rowsOnPage) : 0,
                    paginationLinks = this.nodes.pagination.getElementsByTagName("a"),
                    activePageNumber = (lastPos) ? pagesCount - 1 : 0,
                    self = this;

                for (let i = 1; i <= pagesCount; i++) {

                    let li = document.createElement('li');

                    li.innerHTML = '<a href="#">' + i + '</a>';
                    paginationButtons.appendChild(li);
                }
                paginationButtons.children[activePageNumber].className = 'active';

                this.nodes.pagination.appendChild(paginationButtons);
                this._fillHTMLTable(startPos, endPos);

                for (let i = 0; i < paginationLinks.length; i++) {
                    paginationLinks[i].onclick = function () {
                        let pageNumber = +paginationLinks[i].innerHTML;
                        endPos = Math.min( pageNumber  * rowsOnPage, itemCount);
                        startPos = (pageNumber - 1) * rowsOnPage;

                        self._fillHTMLTable(startPos, endPos);

                        self.nodes.pagination.children[activePageNumber].className = '';
                        self.nodes.pagination.children[i].className = 'active';
                        activePageNumber = i;
                    };
                }
            } else {
                this._fillHTMLTable();
            }
        },

        _sortTable: function () {
            let self = this;

            for (let i = 0; i < this.nodes.tableTiles.length; i++) {
                this.nodes.tableTiles[i].onclick = function () {


                    if (this.classList.contains('sorted-ascending')) {
                        self.productTableDataArr.reverse();
                        this.classList.remove('sorted-ascending');
                        this.classList.add('sorted-descending');
                    } else {
                        if (i === 1) {
                            self.productTableDataArr.sort(compareText);

                        } else {
                            self.productTableDataArr.sort(compareNumbers);
                        }

                        this.classList.remove('sorted-descending');
                        this.classList.add('sorted-ascending');
                    }

                    for (let j = 0; j < self.nodes.tableTiles.length; j++) {
                        if (j != i) {
                            self.nodes.tableTiles[j].classList.remove('sorted-ascending');
                            self.nodes.tableTiles[j].classList.remove('sorted-descending');
                        }
                    }

                    function compareNumbers(a, b) {
                        return (a[i] < b[i]) ? -1 : 1;
                    }

                    function compareText(a, b) {
                        return (a[i].toLowerCase() < b[i].toLowerCase()) ? -1 : 1;
                    }

                    //  debugger;
                    self._paginateTable();
                }
            }
        },

        _dragAndDropSorting: function (e) {
            let dragObject = {};

            document.onmousedown = function (e) {
                if (e.which != 1) {
                    return;
                }

                let elem = e.target.closest('tbody');


                if (!elem) return;
                dragObject.elem = e.target.closest('tr');

                dragObject.elemY = e.pageY;

                document.onmousemove = function (e) {
                    let tBody = document.getElementById('products-list'),
                        tBodyTop = tBody.offsetTop,
                        tBodyBottom = tBodyTop + tBody.offsetHeight,
                        elemTop = dragObject.elem.offsetTop;

                    let newY = e.pageY - dragObject.elemY;

                    if (newY < -3 && ((elemTop - tBodyTop) + newY) < 0) {
                        newY = tBodyTop - elemTop;
                        console.log('if 1');
                    }

                    if (newY > 3 && (tBodyBottom) < (elemTop + newY + dragObject.elem.offsetHeight)) {
                        newY = tBodyBottom - elemTop - dragObject.elem.offsetHeight;
                    }

                    dragObject.elem.style.transform = 'translateY(' + newY + 'px)';
                }
            },

            document.onmouseup = function () {
                document.onmousemove = null;
                dragObject.elem.hidden = true;
                let td = document.elementFromPoint(event.clientX, event.clientY);
                let swapElem = td.closest('tr');
                debugger;
            }
        }
    };
})();
tableEdit._init();
