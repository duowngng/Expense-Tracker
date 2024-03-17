'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, onSnapshot, deleteDoc, updateDoc, doc } from "firebase/firestore"; 
import { db } from "./firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Home() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ name: "", price: "" })
  const [total, setTotal] = useState(0)
  const [editedItemId, setEditedItemId] = useState(null);
  const [updatedName, setUpdatedName] = useState('')
  const [updatedPrice, setUpdatedPrice] = useState('')

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault()
    if (newItem.name !== "" && newItem.price !== "") {
      // setItems([...items, newItem]);
      await addDoc(collection(db, "users", user.uid, "items"), {
          name: newItem.name.trim(),
          price: newItem.price,
      });
      setNewItem({ name: "", price: "" });
    }
  }

  // Read items from database
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "users", user.uid, "items"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let items = [];
  
        querySnapshot.forEach((doc) => {
          items.push({ ...doc.data(), id: doc.id });
        });
        setItems(items);
  
        // Recalculate total
        const calculatedTotal = () => {
          const totalPrice = items.reduce((sum, item) =>
            sum + parseFloat(item.price), 0)
          setTotal(totalPrice);
        };
        calculatedTotal();
        return () => unsubscribe();
      });
    }
  }, [user]);

  // Update item in database
  const updateItem = async (id, newName, newPrice) => {
    const itemRef = doc(db, "users", user.uid, "items", id);
    await updateDoc(itemRef, { name: newName, price: newPrice });
  };

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "items", id));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 bg-gray-900">
        <p>Initialising User...</p>
      </main>
    );
  }

  // Redirect to sign in if no user
    if (!user && !loading) {
      router.push('/sign-in')
    }

  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 bg-gray-900">
        
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl p-4 text-center text-white">Expense Tracker</h1>
          <div className="bg-slate-800 p-4 rounded-lg">
            <form className="grid grid-cols-6 items-center text-black">
              <input 
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="col-span-3 p-3 border" 
              type="text" 
              placeholder="Enter item">
              </input>
              <input 
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="col-span-2 p-3 border mx-3" 
              type="number" 
              placeholder="Enter $">
              </input>
              <button 
              onClick={addItem}
              className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl" 
              type="submit">
                +
              </button>
            </form>
            <ul> 
            {items.map((item, id) => (
              <li key={id} className="my-4 w-full flex justify-between bg-slate-950 h-16">
                <div className="p-4 w-full grid grid-cols-[6fr,6fr,1fr,1fr] gap-4 text-white">
                  {editedItemId === item.id ? (
                    <>
                      <input 
                        value={updatedName} 
                        onChange={e => setUpdatedName(e.target.value)} 
                        className="capitalize bg-white text-black border border-gray-300 rounded-lg py-1 px-4 block w-full appearance-none leading-normal h-full"
                      />
                      <input 
                        value={updatedPrice} 
                        onChange={e => setUpdatedPrice(e.target.value)} 
                        className="flex-grow bg-white text-black border border-gray-300 rounded-lg py-1 px-4 block w-full appearance-none leading-normal h-full"
                      />
                    </>
                  ) : (
                    <>
                      <span className="capitalize flex items-center">{item.name}</span>
                      <span className="flex flex-grow items-center">${item.price}</span>
                    </>
                  )}
                  {editedItemId === item.id ? (
                    <>
                      <button
                      onClick={() => {
                        updateItem(item.id, updatedName, updatedPrice);
                        setEditedItemId(null);
                      }}
                      className="justify-self-end px-4 py-1 rounded-md text-white bg-green-500 hover:bg-green-700 focus:outline-none h-full"
                      >
                        <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                        </svg>
                      </button>
                      <button
                      onClick={() => setEditedItemId(null)}
                      className="justify-self-end px-4 py-1 rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none h-full"
                      >
                        <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                      onClick={() => {
                        setUpdatedName(item.name); 
                        setUpdatedPrice(item.price); 
                        setEditedItemId(item.id);
                      }} 
                      className="justify-self-end px-4 py-1 rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none h-full"
                      >
                        <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="auto" height="100%" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                      <button
                      onClick={() => deleteItem(item.id)}
                      className="justify-self-end px-4 py-1 rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none h-full"
                      >
                        <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="auto" height="100%" fill="currentColor" viewBox="0 0 24 24">
                          <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
            </ul>
            {items.length > 0 && (
              <div className="flex justify-between p-3 text-white">
                <span>Total</span>
                <span>${total}</span>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <button
            onClick={() => {
              signOut(auth)
              sessionStorage.removeItem('user')
            }}
            className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4 mb-8"
            >
              Log out
            </button>
          </div>
          
        </div>
        
      </main>
    );
  }
}
