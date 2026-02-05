import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

import * as bootstrap from "bootstrap";
import "./assets/style.css";
import LoginPage from "./pages/LoginPage";
import BootstrapModal from "./components/BootstrapModal";


function App() {
  const url = import.meta.env.VITE_URL;
  const path = import.meta.env.VITE_PATH;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const productModalRef = useRef(null); // 用來抓子組件的 div 節點
  const modalInstance = useRef(null); // 用來存Bootstrap new出來的實例

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      modalInstance.current = new bootstrap.Modal(productModalRef.current, {
        keyboard: false,
      });
    }
  }, [isLoading]);

  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${url}/api/${path}/admin/products`);
      setProducts(res.data.products);
    } catch (err) {
      console.dir(err);
    }
  }, [url, path]);

  useEffect(() => {
    const checkAdminLogin = async () => {
      try {
        const res = await axios.post(`${url}/api/user/check`);

        if (res.data.success) {
          setIsAuth(true);
          await getProducts();
        }
      } catch (err) {
        setIsAuth(false);
        console.dir(err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminLogin();
  }, [url, getProducts]);

  const defaultProductState = {
    title: "",
    category: "",
    origin_price: 0,
    price: 0,
    unit: "",
    description: "",
    content: "",
    is_enabled: 0,
    imageUrl: "",
    imagesUrl: [],
  };

  const [templateProduct, setTemplateProduct] = useState(defaultProductState);
  const [modalMode, setModalMode] = useState("");

  const openModal = (mode, product = null) => {
    setModalMode(mode);
    if (mode === "create") {
      setTemplateProduct(defaultProductState);
    } else if (mode === "edit" || mode === "delete") {
      //把edit和delete寫在一起，因為都需要帶入產品資料
      setTemplateProduct({
        // 確保欄位都有預設值，避免undefined而噴錯
        title: product.title || "",
        category: product.category || "",
        origin_price: product.origin_price || 0,
        price: product.price || 0,
        unit: product.unit || "",
        description: product.description || "",
        content: product.content || "",
        is_enabled: product.is_enabled || 0,
        imageUrl: product.imageUrl || "",
        imagesUrl: product.imagesUrl ? [...product.imagesUrl] : [],
        id: product.id, //編輯和刪除絕對需要的 ID
      });
    }
    modalInstance.current.show();
  };

  const closeModal = () => {
    modalInstance.current.hide();
  };

  const handleTemplateChange = (e) => {
    const { id, value, type, checked } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,

      //id如果是is_enabled且type是checkbox的話，我們給他checked的值
      //id如果是content、price、...或別的，我們一律給value的值
      //如果是數字欄位，轉為Number
      [id]:
        type === "checkbox"
          ? checked
          : id === "origin_price" || id === "price"
          ? Number(value)
          : value,
    }));
  };

  const handleMainImageUrlChange = (e) => {
    setTemplateProduct((prev) => {
      return { ...prev, imageUrl: e.target.value };
    });
  };

  const handleImagesUrlChange = (e, index) => {
    const { value } = e.target;
    setTemplateProduct((prev) => {
      const newImages = [...prev.imagesUrl];
      newImages[index] = value; //改對應index
      return { ...prev, imagesUrl: newImages };
    });
  };

  const addImage = () => {
    setTemplateProduct((prev) => {
      if (prev.imagesUrl.length >= 4) return prev;
      return {
        ...prev,
        imagesUrl: [...prev.imagesUrl, ""],
      };
    });
  };

  const deleteImage = () => {
    setTemplateProduct((prev) => {
      if (prev.imagesUrl.length === 0) return prev;
      const newImages = [...prev.imagesUrl];
      newImages.pop();
      return { ...prev, imagesUrl: newImages };
    });
  };

  const handleModalConfirm = async () => {
    try {
      //清洗不必要的主、副圖資料
      const cleanMainImage =
        templateProduct.imageUrl.trim() !== ""
          ? templateProduct.imageUrl
          : null;
      const cleanImagesUrl = templateProduct.imagesUrl.filter(
        (url) => url.trim() !== ""
      );

      //組出真正要送的 product，重要的是is_enabled必須是1 or 0，而非true or false
      const productData = {
        ...templateProduct,
        imageUrl: cleanMainImage,
        imagesUrl: cleanImagesUrl,
        is_enabled: templateProduct.is_enabled ? 1 : 0,
      };

      let api = "";
      let method = "";
      if (modalMode === "create") {
        api = `${url}/api/${path}/admin/product`;
        method = "post";
        await axios[method](api, {
          data: productData,
        });
      } else if (modalMode === "edit") {
        api = `${url}/api/${path}/admin/product/${templateProduct.id}`;
        method = "put";
        await axios[method](api, {
          data: productData,
        });
      } else if (modalMode === "delete") {
        api = `${url}/api/${path}/admin/product/${templateProduct.id}`;
        method = "delete";
        await axios[method](api);
      }

      //成功後處理關閉modal、刷新產品列表
      closeModal();
      await getProducts();

      //只有新增時才重置
      if (modalMode === "create") {
        setTemplateProduct(defaultProductState);
      }
    } catch (err) {
      console.error(err.response?.data?.message);
      alert(err.response?.data?.message || "操作失敗");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/admin/signin`, formData);
      const { token, expired } = res.data;

      // 將token存入cookie，供後續重新整理頁面時使用
      document.cookie = `hexToken=${token}; expires=${new Date(
        expired
      )};  path=/`;

      // 由於登入後會立刻呼叫API取得產品資料，
      // 因此需要即時設定axios的 Authorization。
      axios.defaults.headers.common["Authorization"] = token;

      setFormData({
        username: "",
        password: "",
      });
      setIsAuth(true);
      await getProducts();
    } catch (err) {
      setIsAuth(false);
      console.dir(err);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  //確保打開頁面 or 刷新 時，不會因為檢查token而出現 登入畫面 閃一下進入 產品列表畫面
  if (isLoading) {
    return <p className="text-center mt-5">載入中...</p>;
  }
  return (
    <>
      {isAuth ? (
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button
                className="btn btn-primary"
                //呼叫時用 modalInstance
                onClick={() => openModal("create")}
              >
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.category}</td>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        {product.is_enabled ? (
                          <span className="text-success">啟用</span>
                        ) : (
                          <span className="text-failed">未啟用</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              openModal("edit", product);
                            }}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              openModal("delete", product);
                            }}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <LoginPage
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          formData={formData}
        />
      )}
      {/*將 productModalRef 傳進去抓取 DOM*/}
      <BootstrapModal
        ref={productModalRef}
        closeModal={closeModal}
        templateProduct={templateProduct}
        handleTemplateChange={handleTemplateChange}
        modalMode={modalMode}
        handleMainImageUrlChange={handleMainImageUrlChange}
        handleImagesUrlChange={handleImagesUrlChange}
        addImage={addImage}
        deleteImage={deleteImage}
        handleModalConfirm={handleModalConfirm}
      />
    </>
  );
}

export default App;

