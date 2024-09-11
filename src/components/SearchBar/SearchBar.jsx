import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import styles from "./SearchBar.module.css";

const token = "";

const axiosTable = axios.create({
  baseURL: "https://api.github.com",
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

function SearchBar() {
  const [value, setValue] = useState("");
  const [users, setUsers] = useState([]);
  const [sortingOrder, setSortingOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axiosTable.get(
        `/search/users?q=${value}&page=${page}`
      );
      const usersRepositories = await Promise.all(
        response.data.items.map(async (user) => {
          try {
            setLoadingUserData(true);
            const userData = await axiosTable.get(`/users/${user.login}`);
            setLoadingUserData(false);
            return { ...user, repository: userData.data.repository };
          } catch (error) {
            if (error.response.status === 403) {
            }
            return user;
          }
        })
      );
      setUsers(usersRepositories);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    if (value) {
      fetchData();
    }
  }, [value, page]);

  const handleSorting = () => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortingOrder === "asc") {
        return a.repository - b.repository;
      } else {
        return b.repository - a.repository;
      }
    });
    setUsers(sortedUsers);
    setSortingOrder(sortingOrder === "asc" ? "desc" : "asc");
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.textbox}
        type="text"
        placeholder="Введите имя пользователя"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className={styles.sortbutton} onClick={handleSorting}>
        Сортировка по количеству репозиториев (
        {sortingOrder === "asc" ? "По возрастанию" : "По убыванию"})
      </button>

      <div>
        {users.map((user) => (
          <div key={user.id} onClick={() => handleUserClick(user)}>
            <p>
              {user.login} / Repository: {user.repository || "Null"}
            </p>
          </div>
        ))}
      </div>
      {selectedUser && (
        <div>
          {loadingUserData ? (
            <p>Загрузка данных пользователя</p>
          ) : (
            <>
              <h3>{selectedUser.login}</h3>
              <p>
                <a
                  href={selectedUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
