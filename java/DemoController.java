package com.pw.xxx;

import com.google.gson.Gson;
import com.pw.lfr.core.support.database.SequenceUtil;
import org.apache.commons.fileupload.FileItem;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

/**
 * Created by PoemWhite on 2016/11/18.
 */
@Controller
@RequestMapping(value = "/demo")
public class DemoController {


    @RequestMapping(value = "imageUpload3",method = RequestMethod.GET)
    public String imageUpload3(HttpServletRequest request){
        return "module/demo/image_upload3.ftl";
    }

    @RequestMapping(value="upload3", method= RequestMethod.POST)
    @ResponseBody
    public Object upload3(HttpServletRequest request, HttpServletResponse response)
            throws Exception {

        String localPath = "/static/upload";
        String uploadPath = request.getRealPath(localPath);

        File dir = new File(uploadPath);
        if (!dir.exists())
            dir.mkdirs();

        if(request instanceof MultipartRequest) {
            MultiValueMap<String, MultipartFile> map = ((MultipartRequest) request).getMultiFileMap();

            LinkedList<CommonsMultipartFile> imageList = (LinkedList) map.get("file");

            if (imageList != null && imageList.size() > 0) {

                CommonsMultipartFile file = imageList.get(0);

                String picId = SequenceUtil.uuid2();
                String fileName = picId+".jpg";

                FileItem fileItem = file.getFileItem();
                if (!fileItem.isFormField()) {

                    fileItem.write(new File(uploadPath, fileName));


                    Map result = new HashMap();

                    result.put("picId",picId);

                    return new Gson().toJson(result);

                }
            }
        }

        return null;
    }


}
