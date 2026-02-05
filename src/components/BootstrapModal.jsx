import { forwardRef } from "react";
const BootstrapModal = forwardRef((props, ref) => {
  const {
    closeModal,
    templateProduct,
    handleTemplateChange,
    modalMode,
    handleMainImageUrlChange,
    handleImagesUrlChange,
    addImage,
    deleteImage,
    handleModalConfirm,
  } = props;

  //如果是undefined，就給空陣列
  const images = templateProduct.imagesUrl || [];
  //避免[images.length - 1]運算結果為-1
  const lastImageIsEmpty =
    images.length > 0 && images[images.length - 1] === "";

  return (
    <>
      <div
        ref={ref}
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div
              className={`modal-header ${
                modalMode === "delete" ? "bg-danger" : "bg-dark"
              } text-white`}
            >
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalMode === "create"
                    ? "新增產品"
                    : modalMode === "edit"
                    ? "編輯產品"
                    : "刪除產品"}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                // data-bs-dismiss="modal"
                onClick={closeModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalMode === "delete" ? (
                <p className="h2">
                  確定要刪除
                  <span className="text-danger">{templateProduct.title}</span>
                  嗎?
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateProduct.imageUrl}
                          onChange={handleMainImageUrlChange}
                        />
                      </div>
                      {/* 只有當有網址時才顯示img */}
                      {templateProduct.imageUrl && (
                        <img
                          className="img-fluid"
                          src={templateProduct.imageUrl}
                          alt="主圖"
                        />
                      )}
                    </div>
                    <div>
                      {templateProduct.imagesUrl.map((imageUrl, index) => {
                        return (
                          <div key={index} className="mb-2">
                            <input
                              type="text"
                              className="form-control mb-2"
                              placeholder={`圖片網址${index + 1}`}
                              value={imageUrl}
                              onChange={(e) => handleImagesUrlChange(e, index)}
                            />
                            {/* 只有當有網址時才顯示img */}
                            {imageUrl && (
                              <img
                                className="img-fluid"
                                src={imageUrl}
                                alt={`副圖${index + 1}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <button
                        className="btn btn-outline-primary btn-sm d-block w-100"
                        onClick={addImage}
                        disabled={images.length >= 4 || lastImageIsEmpty}
                      >
                        新增圖片
                      </button>
                    </div>
                    <div>
                      <button
                        className="btn btn-outline-danger btn-sm d-block w-100"
                        onClick={deleteImage}
                      >
                        刪除圖片
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={handleTemplateChange}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={handleTemplateChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={handleTemplateChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">
                          原價
                        </label>
                        <input
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={handleTemplateChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={handleTemplateChange}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={handleTemplateChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={handleTemplateChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          onChange={handleTemplateChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="is_enabled"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                // data-bs-dismiss="modal"
                onClick={closeModal}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleModalConfirm}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default BootstrapModal;