//BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentages = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentages = function() {
    return this.percentage;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val) {
      var newItem;
      var ID = 0;
      //create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //create new items
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //calculate the budget '''
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage of the income we spent
      if (data.totals.inc > 0) {
        data.percentages = Math.round(
          (data.totals.exp / data.totals.inc) * 100
        );
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems["exp"].forEach(function(cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allperc = data.allItems.exp.map(function(cur) {
        return cur.getPercentages();
      });
      return allperc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        tatalExp: data.totals.exp,
        percentage: data.percentages
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();
// 88**************************************************************************************************************************************************************************************************************########################################################################################################################################################################################################################################################

//UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add_type",
    inputDescription: ".add_description",
    inputValue: ".add_value",
    inputBtn: ".add_btn",
    incomeContainer: ".income_list",
    expensesContainer: ".expenses_list",
    budgetLabel: ".budget_value",
    incomeLabel: ".budget_income-value",
    expensesLable: ".budget_expenses-value",
    percentageLable: ".budget_expenses-percentage",
    container: ".container",
    expensePercLabel: ".item_percentage",
    dateLable: ".budget_title-month"
  };
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    return (
      (type === "exp" ? (sign = "-") : (sign = "+")) + " " + int + "." + dec
    );
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      //html string with place holder
      var html, newHtml, element;
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item_description"> %description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn">DEL<i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item_description"> %description% </div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn">DEL<i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholder with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);

      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //Insert html into DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItems: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLable
      ).textContent = formatNumber(obj.tatalExp, "exp");
      document.querySelector(DOMstrings.percentageLable).textContent =
        obj.percentage;
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      var now, year;
      now = new Date();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLable).textContent = year;
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();
//#####################################################################################################################################################################################################################################################################################################################################################################################################################################################################################################

//GLOBAL  app controller
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListners = function() {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode == 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    //calculate bug=dget
    budgetCtrl.calculateBudget();

    //return budget
    var budget = budgetCtrl.getBudget();

    //display the budget
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function() {
    //calculate budget
    budgetCtrl.calculatePercentages();
    //read percentages
    var percentages = budgetCtrl.getPercentages();

    //update ui with new percentages
    UICtrl.displayPercentages(percentages);
  };
  var ctrlAddItem = function() {
    var input, newItem;
    //1.input data
    input = UICtrl.getInput();
    console.log(input);
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2.add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3.add item to UI
      UICtrl.addListItem(newItem, input.type);
      //4.clearfielsd
      UICtrl.clearFields();

      //5.calculate budget and update
      updateBudget();

      //6.calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-id
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1.delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      //delete the item from user interface
      UICtrl.deleteListItems(itemID);

      //update and show the new budget
      updateBudget();

      //6.calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("appp");
      UICtrl.displayMonth();

      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        tatalExp: 0,
        percentage: 0
      });
      setupEventListners();
    }
  };
})(budgetController, UIController);
controller.init();
