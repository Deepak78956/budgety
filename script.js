var budgetController = (function() {
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Expense = function(id, description, value, percentage) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = percentage;
  };

  Expense.prototype.calcPercentage = function(income) {
    if (income > 0) {
      this.percentage = Math.round((this.value / income) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var calculateTotals = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  // here ID is a unique number we want to assign to a newItem that is either an expense or an income so we can later access them using their id's
  // so now we can assign id as len(array)+1 [id's = 1 2 3 4 5] nextId = 5 + 1 this can be done but there is a one big problem with this that later we are going to delete elements from aray then array would look something like [1,2,3,6,8] (ideally nextId should be 9) but using length nextId id 6 which already exists and we want distinct Id's so we have to do something else
  // we want our id as lastId + 1 and to retrieve lastId we can do data.allItems[type][data.allItems[type].length - 1].id
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    testing: function() {
      console.log(data);
    },

    deleteItem: function(delId, delType) {
      var ids, index;
      ids = data.allItems[delType].map(function(curr) {
        return curr.id;
      });
      index = ids.indexOf(delId);
      if (index !== -1) {
        data.allItems[delType].splice(index, 1);
      }
    },

    calculateBudget: function() {
      calculateTotals("exp");
      calculateTotals("inc");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp
      };
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercs = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercs;
    },

    showItem: function() {
      console.log(data);
    }
  };
})();

var UIController = (function() {
  var DOMStrings = {
    inputType: ".dropDown",
    inputDesc: ".textBox",
    inputValue: ".textBoxValue",
    inputCheckmark: ".checkmark--js",
    incomeContainer: ".inc_list",
    expenseContainer: ".exp_list",
    budgetLabel: ".budget_value",
    incomeLabel: ".budget_income_value",
    expenseLabel: ".budget_expense_value",
    percentageLabel: ".budget_expense_percentage",
    container: ".container",
    expensePercLabel: ".item_percentage",
    currentMonth: ".availableBudget_month"
  };

  formatNumbers = function(num, type) {
    var numSplit, descPart, intPart;

    num = num.toFixed(2);
    numSplit = num.split(".");
    intPart = numSplit[0];
    descPart = numSplit[1];
    if (intPart.length > 3) {
      intPart =
        intPart.substr(0, intPart.length - 3) +
        "," +
        intPart.substr(intPart.length - 3, 3);
    }
    return (type === "exp" ? "-" : "+") + " " + intPart + "." + descPart;
  };

  varNodeListForEach = function(fields, callback) {
    for (var i = 0; i < fields.length; i++) {
      callback(fields[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        desc: document.querySelector(DOMStrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    }, // use a comma here beacause it is an object(dictionary) now to provide access to methods outside UICOntroller we have to do this
    // we have to do newHtml.replace() not html.replace() because if we use html.replace() it will make changes in the initial html string but we want to change in the previously changed string of html i.e newHtml so we used newHtml.replace()
    getOutput: function(obj, type) {
      var element, html, newHtml;
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item_description" >%description%</div ><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      } else {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item_description" >%description%</div ><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">15%</div><div class="item_delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumbers(obj.value, type));
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDesc + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var tp;
      obj.budget > 0 ? (tp = "inc") : (tp = "exp");
      document.querySelector(
        DOMStrings.budgetLabel
      ).textContent = formatNumbers(obj.budget, tp);
      document.querySelector(
        DOMStrings.incomeLabel
      ).textContent = formatNumbers(obj.totalInc, "inc");
      document.querySelector(
        DOMStrings.expenseLabel
      ).textContent = formatNumbers(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    delteteListItem: function(selectedId) {
      var el = document.getElementById(selectedId);
      el.parentNode.removeChild(el);
    },

    showPercentages: function(percentages) {
      var percNodes = document.querySelectorAll(DOMStrings.expensePercLabel);
      varNodeListForEach(percNodes, function(cur, index) {
        if (percentages[index] > 0) {
          cur.textContent = percentages[index] + "%";
        } else {
          cur.textContent = "---";
        }
      });
    },

    getMonth: function() {
      var dateObj, year, month, months;
      dateObj = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = dateObj.getMonth();
      year = dateObj.getFullYear();
      document.querySelector(DOMStrings.currentMonth).textContent =
        months[month] + " " + year;
    },

    showRed: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDesc +
          "," +
          DOMStrings.inputValue
      );
      varNodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.inputCheckmark).classList.toggle("red");
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})(); // immediately invoked function expressions

var controller = (function(UICtrl, budgetCtrl) {
  var DOM = UICtrl.getDOMStrings(); // don't forget to call getDOMStrings you have to add parenthesis like getDOMStrings() so that DOM can access the function

  var updateBudget = function() {
    var budget;
    budgetCtrl.calculateBudget();
    budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function() {
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.showPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
      UICtrl.getOutput(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentage();
    }
  };

  var ctrlDelItem = function(event) {
    var strId, ID, type, strSpl;
    strId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (strId) {
      strSpl = strId.split("-");
      type = strSpl[0];
      ID = parseInt(strSpl[1]);
      budgetCtrl.deleteItem(ID, type);
      UICtrl.delteteListItem(strId);
      updateBudget();
    }
  };

  var getEventListeners = function() {
    document.addEventListener("keypress", function(ev) {
      if (ev.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.inputCheckmark)
      .addEventListener("click", ctrlAddItem);
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDelItem);
    // Event Delegation used here we selected .container instead of individual targets
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.showRed);
  };

  return {
    init: function() {
      console.log("Program has been started");
      UICtrl.displayBudget({
        budget: 0,
        percentage: 0,
        totalInc: 0,
        totalExp: 0
      });
      UICtrl.getMonth();
      getEventListeners();
    }
  };
})(UIController, budgetController);
controller.init();
