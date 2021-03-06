// Database
const query = require('../../core/database');

class Expenses {
  /*
   * Get all bill categories
   * @return {object} Bill categories
   */
  async getBillCategories() {
    return await query(
      `SELECT 
          PE.id, PE.categoryName
        FROM 
        tb_plugin_expenses_categories AS PE`
    )
      .then((categories) => {
        // Check if has result
        if (categories != null && categories.length > 0) {
          // Return the categories
          return categories.map((item) => {
            return { ...item };
          });
        } else {
          return null;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Get all the available bills for the group
   * @param userId
   * @param circleId
   * @return {object} List of Bills
   */
  async getBills(userId, circleId) {
    return await query(
      `SELECT 
              PE.id, PE.billName, PE.billAmount, PE.billCategoryId, EC.categoryNAme, PE.billDate
              FROM 
              tb_plugin_expenses AS PE INNER JOIN tb_circle_member AS CM 
              on PE.circleId = CM.circleId INNER JOIN tb_plugin_expenses_categories AS EC  on PE.billCategoryId = EC.id WHERE CM.userId = ? AND CM.circleId = ? ORDER BY PE.billDate DESC`,
      [userId, circleId]
    )
      .then((bills) => {
        // Check if has result
        if (bills != null && bills.length >= 0) {
          // Return the bills
          return bills.map((item) => {
            return { ...item };
          });
        } else {
          return null;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Adds a bill
   * @param  circleId
   * @param  userId
   * @param  billName
   * @param  billAmount
   * @param  billCategoryId
   * @param  billDate
   */
  async addBill(
    circleId,
    userId,
    billName,
    billAmount,
    billCategoryId,
    billDate
  ) {
    return await query(
      `INSERT INTO tb_plugin_expenses
          ( circleId,
            userId,
            billName,
            billAmount,
            billCategoryId,
            billDate) 
        VALUES 
          (?, ?, ?, ?, ?, ?)`,
      [circleId, userId, billName, billAmount, billCategoryId, billDate]
    )
      .then((result) => {
        if (result != null) {
          return parseInt(result.insertId);
        } else {
          return 0;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Removes a bill
   * @param userId
   * @param billId
   * @param circleId
   */
  async removeBill(userId, billId, circleId) {
    return await query(
      `DELETE from tb_plugin_expenses WHERE id = ? AND circleId=?`,
      [billId, circleId]
    )
      .then((result) => {
        if (result != null) {
          return parseInt(result.affectedRows);
        } else {
          return 0;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  // ***************************************************************//
  /**
   * methods concerning the budget below:
   */
  // ***************************************************************//

  /**
   * Adds a budget
   * @param circleId
   * @param userId
   * @param budgetName
   * @param budgetAmount
   * @param budgetStartDate
   * @param budgetEndDate
   */
  async addBudget(
    circleId,
    userId,
    budgetName,
    budgetAmount,
    budgetStartDate,
    budgetEndDate
  ) {
    return await query(
      `INSERT INTO tb_plugin_expenses_budget
          ( circleId,
            userId,
            budgetName,
            budgetAmount,
            budgetStartDate,
            budgetEndDate) 
        VALUES 
          (?, ?, ?, ?, ?, ?)`,
      [
        circleId,
        userId,
        budgetName,
        budgetAmount,
        budgetStartDate,
        budgetEndDate,
      ]
    )
      .then((result) => {
        if (result != null) {
          return parseInt(result.insertId);
        } else {
          return 0;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Get all the available budgets for the group
   * @param userId
   * @param circleId
   * @return {object} List of Budgets
   */
  async getBudgets(userId, circleId) {
    return await query(
      `SELECT 
              PEB.id, PEB.budgetName, PEB.budgetAmount, PEB.budgetStartDate, PEB.budgetEndDate
              FROM 
              tb_plugin_expenses_budget AS PEB INNER JOIN tb_circle_member AS CM 
              on PEB.circleId = CM.circleId WHERE CM.userId = ? AND CM.circleId = ? ORDER BY PEB.budgetStartDate DESC`,
      [userId, circleId]
    )
      .then((budgets) => {
        // Check if has result
        if (budgets != null && budgets.length >= 0) {
          // Return the budgets
          return budgets.map((item) => {
            return { ...item };
          });
        } else {
          return null;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Removes a budget
   * @param userId
   * @param budgetId
   * @param circleId
   */
  async removeBudget(userId, budgetId, circleId) {
    return await query(
      `DELETE from tb_plugin_expenses_budget WHERE id = ? AND circleId=?`,
      [budgetId, circleId]
    )
      .then((result) => {
        if (result != null) {
          return parseInt(result.affectedRows);
        } else {
          return 0;
        }
      })
      .catch((error) => {
        throw error;
      });
  }
}

// Export
module.exports = Expenses;
